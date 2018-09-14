import React, {Component} from 'react';
import {SheetJSApp} from "../file-parse/sheetjs";
import {DropdownItemProps, Button, Loader} from "semantic-ui-react";
import {connect, MapDispatchToProps} from "react-redux";
import ProgramImportPreview from "./program-import-preview";
import {SubProgram} from "../subprograms/subprogram-reducer";
import {Moment} from "moment";
import {Program} from "./program-reducer";
import moment from "moment"
import {VestingEvent} from "../awards/award-reducer";
import {employeeName, removeDuplicates, replaceAll} from "../utils/utils";
import {Employee} from "../employees/employee-reducer";
import {IMPORT_ALL_PROGRAM_AWARDS} from "./program-actions";
import {changeCommaForPunctuation} from "../utils/utils";

export interface ProgramAwardSheetImport {
    programName: string,
    subProgramName: string,
    instrumentTypeId: string,
    settlementTypeId: string,
    performance: boolean,
    quantity: number,
    employee_id: string,
    grant_date: Moment,
    vested_date: Moment,
    expiry_date: Moment,
    strike: number,
    purchase_price?: number,
    fair_vaule?: number,
}

interface OwnProps {
    instrumentsOptions: DropdownItemProps[],
    settlementOptions: DropdownItemProps[],
    closeImportProgramsModal: () => void
}

interface StateProps {
    employees: Employee[],
    isFetching: boolean
}

interface DispatchProps {
    fetchEmployeesAndEntities: () => void,
    importProgramAwards: (programs: Program[], awards: SingleAwardImport[]) => void
}

interface SubProgramImport extends SubProgram {
    fakeId: string,
    programName: string,
}

export interface SingleAwardImport {
    employee_id: string,
    vesting_events: VestingEvent[]
    subProgramName: string,
    programName: string,
    fakeId: string,
}

interface State {
    programs: Program[],
    awards: SingleAwardImport[],
    error?: string,
}

type Props = OwnProps & StateProps & DispatchProps

const washExcelNumber = (number: string) => replaceAll(number, ",", "");

class ProgramImport extends Component<Props, State> {
    state = {
        programs: [],
        awards: [],
        error: null,
    };

    componentDidMount() {
        this.props.fetchEmployeesAndEntities();
    }

    render() {
        return (
            <div>
                {
                    this.props.isFetching ?
                        <div className="text-content">
                            <Loader active={this.props.isFetching} inline={"centered"}/>
                        </div>
                        :
                        <div className="block-xs">
                            <SheetJSApp handleData={this.handleData}/>
                        </div>
                }
                {
                    this.state.error && <p>{this.state.error}</p>
                }
                {
                    this.state.programs.length > 0 &&
                    <div className="width-limit-medium">
                        <ProgramImportPreview programs={this.state.programs} employees={this.props.employees}
                                              awards={this.state.awards}/>
                    </div>
                }
                {
                    this.state.programs.length > 0 &&
                    <div className='text-center'>
                        <Button primary basic onClick={this.importPrograms}>
                            Import Programs
                        </Button>
                    </div>
                }
            </div>
        );
    }

    private importPrograms = () => {
        this.props.importProgramAwards(this.state.programs, this.state.awards);
        this.props.closeImportProgramsModal();
    };

    private handleData = (data: Array<Array<string>>, cols: any) => {
        const [header, ...importData] = data;

        try {
            const importLines: ProgramAwardSheetImport[] = importData.map((programLine) => {
                    console.log(programLine[5], washExcelNumber(programLine[5]));
                    return {
                        programName: programLine[0],
                        subProgramName: programLine[1],
                        instrumentTypeId: programLine[2],
                        settlementTypeId: programLine[3] === "1" ? "Equity" : "Cash",
                        performance: programLine[4] === "1",
                        quantity: parseInt(washExcelNumber(programLine[5]), 10),
                        employee_id: employeeIdFromEmail(this.props.employees, programLine[6]),
                        grant_date: moment(programLine[8], "MM/DD/YYYY"),
                        vested_date: moment(programLine[9], "MM/DD/YYYY"),
                        expiry_date: moment(programLine[10], "MM/DD/YYYY"),
                        strike: parseFloat(programLine[11]),
                        purchase_price: parseFloat(programLine[12]) === 0 ? null : parseFloat(programLine[12]),
                        fair_vaule: parseExcelDouble(programLine[13]),
                    }
                }
            );

            const programs: Program[] = importLines.map((importLine) => ({
                name: importLine.programName,
                startDate: moment(),
                endDate: moment(),
                capacity: 0,
                incentive_sub_programs: []
            }));

            const uniquePrograms = removeDuplicates(programs, "name");

            const subPrograms: SubProgramImport[] = importLines.map((importLine) => {
                const instrumentTypeName = instrumentTypeIdValidation(this.props.instrumentsOptions, importLine.instrumentTypeId);
                const settlementTypeName = settlementTypeIdValidation(this.props.settlementOptions, importLine.settlementTypeId);

                return {
                    name: importLine.subProgramName,
                    fakeId: `${importLine.programName}${importLine.subProgramName}`,
                    programName: importLine.programName,
                    instrumentTypeId: instrumentTypeName,
                    settlementTypeId: settlementTypeName,
                    performance: importLine.performance,
                    awards: [],
                }
            });

            const uniqueSubPrograms = removeDuplicates(subPrograms, "fakeId");

            uniqueSubPrograms.forEach((subProgram) => {
                const programIndex = uniquePrograms.findIndex((p) => p.name === subProgram.programName);
                if (programIndex === -1) {
                    throw new Error(`Cannot find program ${uniquePrograms[programIndex].name} for sub program ${subProgram.name}`)
                }

                uniquePrograms[programIndex].incentive_sub_programs.push(subProgram);
            });

            const awards: SingleAwardImport[] = importLines.reduce((accumulator: SingleAwardImport[], importLine) => {
                const fakeId = `${importLine.programName}-${importLine.subProgramName}-${importLine.employee_id}`;
                const awardIndex = accumulator.findIndex((awardImport) => awardImport.fakeId === fakeId);

                if (awardIndex === -1) {
                    // Create award + vesting event
                    const newAward: SingleAwardImport = {
                        fakeId,
                        subProgramName: importLine.subProgramName,
                        programName: importLine.programName,
                        employee_id: importLine.employee_id,
                        vesting_events: [{
                            grant_date: importLine.grant_date,
                            vestedDate: importLine.vested_date,
                            expiry_date: importLine.expiry_date,
                            strike: importLine.strike.toString(),
                            purchase_price: importLine.purchase_price ? importLine.purchase_price.toString() : undefined,
                            quantity: importLine.quantity,
                            fair_value: importLine.fair_vaule,
                            is_dividend: false,
                        }]
                    };

                    accumulator.push(newAward)
                } else {
                    // Add vesting event to award
                    const award = accumulator[awardIndex];
                    award.vesting_events.push({
                        grant_date: importLine.grant_date,
                        vestedDate: importLine.vested_date,
                        expiry_date: importLine.expiry_date,
                        strike: importLine.strike.toString(),
                        purchase_price: importLine.purchase_price ? importLine.purchase_price.toString() : undefined,
                        quantity: importLine.quantity,
                        fair_value: importLine.fair_vaule,
                        is_dividend: false,
                    })
                }

                return accumulator;
            }, []);

            awards.forEach((award) => {
                const programIndex = uniquePrograms.findIndex((program) => program.incentive_sub_programs.some((subProgram) => subProgram.name === award.subProgramName));
                const program = uniquePrograms[programIndex];
                const subProgram = program.incentive_sub_programs.find((subProgram) => subProgram.name === award.subProgramName);
                subProgram.awards.push(award);
            });

            this.setState({programs: uniquePrograms, error: null, awards});
        } catch (e) {
            this.setState({error: e.message})
        }

    }
}


const parseExcelDouble = (cell: string | undefined): number | null => cell ? parseFloat(changeCommaForPunctuation(cell)) : null;

const instrumentTypeIdValidation = (instrumentType: DropdownItemProps[], instrumentName: string): string => {
    const instrument = instrumentType.filter((i) => i.text === instrumentName)[0];

    if (!instrument) {
        throw new Error(`Error parsing instrument name: ${instrumentName}. It does not match any of stored instruments name.`)
    }

    return instrument.value as string
};

const settlementTypeIdValidation = (settlementType: DropdownItemProps[], settlementName: string): string => {
    const settlement = settlementType.filter((i) => i.text === settlementName)[0];

    if (!settlement) {
        throw new Error(`Error parsing settlement name: ${settlementName}. It does not match any of stored settlement names.`)
    }

    return settlement.value as string
};

export const employeeNameFromId = (employees: Employee[], employeeId: string): string => {
    console.log(employees);
    const employee = employees.filter((e) => e.id === employeeId)[0];

    if (!employee) {
        throw new Error(`Error parsing employee id: ${employeeId}. It does not match any of stored employee ids.`)
    }

    return `${employee.firstName} ${employee.lastName}`
};

export const employeeIdFromEmail = (employees: Employee[], email: string): string => {
    console.log(employees);
    const employee = employees.filter((e) => {
        console.log(e);
        console.log(email);
        return e.email.toLocaleLowerCase() === email.toLocaleLowerCase();
    })[0];

    if (!employee) {
        throw new Error(`Error parsing employee email: ${email}. It does not match any of stored employee emails.`)
    }

    return employee.id
};

const mapStateToProps = (state): StateProps => {
    return ({
        employees: state.employee.allEmployees,
        isFetching: state.employee.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndEntities: () => dispatch({type: 'FETCH_EMPLOYEES_AND_ENTITIES'}),
    importProgramAwards: (programs: Program[], awards: SingleAwardImport[]) => dispatch({
        type: IMPORT_ALL_PROGRAM_AWARDS,
        programs,
        awards
    })
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(ProgramImport);
