import React, { Component, StatelessComponent } from 'react';
import { SheetJSApp } from "../file-parse/sheetjs";
import { DropdownItemProps, Button, Dimmer, Loader, Table, Message } from "semantic-ui-react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {SubProgram, VestingEventTemplate} from "../subprograms/subprogram-reducer";
import { Moment } from "moment";
import moment from "moment"
import { VestingEvent } from "../awards/award-reducer";
import { removeDuplicates, yesOrNo } from "../utils/utils";
import { Employee } from "../employees/employee-reducer";
import { Program } from "../programs/program-reducer";
import { instrumentOptions, settlementOptions } from "../programs/program-management-page";
import { EntitySheetImport, toEntity, toEntitySheetImport } from "../entity/entity-import";
import { EmployeeSheetImport, toEmployee, toEmployeeSheetImport } from "../employees/employee-import";
import { Entity } from "../entity/entity-reducer";
import EntitiesPreview from "../entity/entity-import-preview";
import EmployeesPreview from "../employees/employee-import-preview";
import { RootState } from "../reducers/all-reducers";
import SpinnerFullScreen from "../common/components/spinner-full-screen";

export interface ProgramAwardSheetImport {
    programName: string,
    subProgramName: string,
    instrumentTypeId: string,
    settlementTypeId: string,
    performance: boolean,
    quantity: number,
    employeeEmail: string,
    grant_date: Moment,
    vested_date: Moment,
    expiry_date: Moment,
    strike: number,
    purchase_price?: number,
}

interface StateProps {
    employees: Employee[],
    isFetching: boolean
}

interface DispatchProps {
    fetchEmployeesAndEntities: () => void,
    importAllModels: (entities: EntitySheetImport[], employees: EmployeeSheetImport[], programs: Program[], awards: SingleAwardImport[]) => void
}

interface SubProgramImport extends SubProgram {
    programName: string,
}

export interface SingleAwardImport {
    employeeEmail: string,
    vesting_events: VestingEvent[]
    subProgramName: string,
    fakeId: string,
}

interface State {
    programs: Program[],
    programsImport: ProgramAwardSheetImport[],
    awards: SingleAwardImport[],
    employees: EmployeeSheetImport[],
    entities: Entity[],
    entitiesSheetImport: EntitySheetImport[],
    error?: string,
}

type Props = StateProps & DispatchProps

class AllModelsImport extends Component<Props, State> {
    state = {
        programs: [],
        programsImport: [],
        awards: [],
        employees: [],
        entities: [],
        entitiesSheetImport: [],
        error: null,
    };

    render() {
        return (
            <div>
                {
                    this.state.error && <p>{this.state.error}</p>
                }
                {
                    this.state.programs.length > 0 &&
                    <div className="width-limit-medium">
                        <EntitiesPreview entities={this.state.entitiesSheetImport}/>
                        <EmployeesPreview employees={this.state.employees} entities={this.state.entities}/>
                        <ProgramsPreview programs={this.state.programsImport} />
                    </div>
                }
                {
                    this.state.programs.length > 0 &&
                    <div className='text-center'>
                        <Button primary basic onClick={this.importPrograms}>
                            Import {this.state.entities.length} entities, {this.state.employees.length} employees and {this.state.awards.length} awards
                        </Button>
                    </div>
                }
                {
                    this.props.isFetching ?
                        <SpinnerFullScreen active/>
                        :
                        <div className="width-limit-medium">
                            <Message
                                header='Import everything'
                                content='Import entities, employees, and awards (including programs and subprograms) from a single Excel sheet. Everything will be created from scratch.'
                            />
                            <SheetJSApp handleData={this.handleData} />
                        </div>
                }
            </div>
        );
    }

    private importPrograms = () => {
        this.props.importAllModels(this.state.entities, this.state.employees, this.state.programs, this.state.awards);
    };

    private handleData = (data: Array<Array<string>>, cols: any) => {
        const [header, ...importData] = data;

        console.log(importData);

        try {
            const entitiesImportData = sectionData(importData, "Entities");
            const entities: EntitySheetImport[] = entitiesImportData.map(toEntitySheetImport);
            const entitiesToBeCreated: Entity[] = entitiesImportData.map(toEntity);
            console.log(entitiesImportData, entitiesToBeCreated);

            const employeesImportData = sectionData(importData, "Employees");
            const employees: EmployeeSheetImport[] = employeesImportData.map(toEmployeeSheetImport);
            const allEmployeesHaveValidEntity = employees.every((employee) => entities.some((entity) => entity.name === employee.entityName));
            if (!allEmployeesHaveValidEntity) {
                this.setState({ error: "Det finnes minst en employee som har et 'entity name' som ikke matcher med noen entities i importdokumentet" })
            }
            // Entity id må være tilstede for å mappe -> flyttes til saga
            //const employeesToBeCreated: Employee[] = employeesImportData.map(toEmployee(entitiesToBeCreated));
            console.log(employeesImportData);

            const programImportData = sectionData(importData, "Programs and Awards");
            console.log(programImportData);

            const programImport: ProgramAwardSheetImport[] = programImportData.map((programLine) => ({
                    programName: programLine[0],
                    subProgramName: programLine[1],
                    instrumentTypeId: programLine[2],
                    settlementTypeId: programLine[3] === "1" ? "Equity" : "Cash",
                    performance: programLine[4] === "1",
                    quantity: parseInt(programLine[5], 10),
                    employeeEmail: programLine[6],
                    grant_date: moment(programLine[8], "MM/DD/YYYY"),
                    vested_date: moment(programLine[9], "MM/DD/YYYY"),
                    expiry_date: moment(programLine[10], "MM/DD/YYYY"),
                    strike: parseFloat(programLine[11]),
                    purchase_price: parseFloat(programLine[12]) === 0 ? null : parseFloat(programLine[12])
                })
            );

            console.log(programImport);

            const programs: Program[] = programImport.map((importLine) => ({
                name: importLine.programName,
                startDate: moment(),
                endDate: moment(),
                capacity: 0,
                incentive_sub_programs: []
            }));

            const uniquePrograms = removeDuplicates(programs, "name");

            const subPrograms: SubProgramImport[] = programImport.map((importLine) => {
                const instrumentTypeName = instrumentTypeIdValidation(instrumentOptions, importLine.instrumentTypeId);
                const settlementTypeName = settlementTypeIdValidation(settlementOptions, importLine.settlementTypeId);

                return {
                    name: importLine.subProgramName,
                    programName: importLine.programName,
                    instrumentTypeId: instrumentTypeName,
                    settlementTypeId: settlementTypeName,
                    performance: importLine.performance,
                    awards: [],
                }
            });

            const uniqueSubPrograms = removeDuplicates(subPrograms, "name");

            uniqueSubPrograms.forEach((subProgram) => {
                const programIndex = uniquePrograms.findIndex((p) => p.name === subProgram.programName);
                if (programIndex === -1) {
                    throw new Error(`Cannot find program ${uniquePrograms[programIndex].name} for sub program ${subProgram.name}`)
                }

                uniquePrograms[programIndex].incentive_sub_programs.push(subProgram);
            });

            console.log(uniquePrograms);

            const awards: SingleAwardImport[] = programImport.reduce((accumulator: SingleAwardImport[], importLine) => {
                const fakeId = `${importLine.subProgramName}-${importLine.employeeEmail}`;
                const awardIndex = accumulator.findIndex((awardImport) => awardImport.fakeId === fakeId);

                if (awardIndex === -1) {
                    // Create award + vesting event
                    const newAward: SingleAwardImport = {
                        fakeId,
                        subProgramName: importLine.subProgramName,
                        employeeEmail: importLine.employeeEmail,
                        vesting_events: [{
                            grant_date: importLine.grant_date,
                            vestedDate: importLine.vested_date,
                            expiry_date: importLine.expiry_date,
                            strike: importLine.strike.toString(),
                            purchase_price: importLine.purchase_price ? importLine.purchase_price.toString() : undefined,
                            quantity: importLine.quantity,
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

            this.setState({ programs: uniquePrograms, employees, entities: entitiesToBeCreated, entitiesSheetImport: entities, error: null, awards, programsImport: programImport });
        } catch (e) {
            this.setState({ error: e.message })
        }

    }
}

const instrumentTypeIdValidation = (instrumentType: DropdownItemProps[], instrumentName: string): string => {
    const instrument = instrumentType.filter((i) => i.text === instrumentName)[0];

    if  (!instrument) {
        throw new Error(`Error parsing instrument name: ${instrumentName}. It does not match any of stored instruments name.`)
    }

    return instrument.value as string
};

const settlementTypeIdValidation = (settlementType: DropdownItemProps[], settlementName: string): string => {
    const settlement = settlementType.filter((i) => i.text === settlementName)[0];

    if  (!settlement) {
        throw new Error(`Error parsing settlement name: ${settlementName}. It does not match any of stored settlement names.`)
    }

    return settlement.value as string
};

export const employeeNameFromId = (employees: Employee[], employeeId: string): string => {
    const employee = employees.filter((e) => e.id === employeeId)[0];

    if (!employee) {
        throw new Error(`Error parsing employee id: ${employee.id}. It does not match any of stored employee ids.`)
    }

    return `${employee.firstName} ${employee.lastName}`
};

const sectionData = (importData: Array<Array<string>>, sectionName: string): Array<Array<string>> => {
    const startIndex = importData.findIndex((line) => line[0] === sectionName) + 2;
    let endIndex = importData.slice(startIndex).findIndex((line, index, array) => {
        debugger;
        return !line[0] || index === array.length - 1
    }) + startIndex;

    // Siste importseksjon har ikke en tom rad på slutten og må derfor inkluderes med å øke sluttindeksen med 1.
    if (importData[endIndex][0]) {
        endIndex++;
    }

    return importData.slice(startIndex, endIndex);
};

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        employees: state.employee.allEmployees,
        isFetching: state.import.isLoading
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndEntities: () => dispatch ({ type: 'FETCH_EMPLOYEES_AND_ENTITIES' }),
    importAllModels: (entities: EntitySheetImport[], employees: EmployeeSheetImport[], programs: Program[], awards: SingleAwardImport[]) => dispatch({ type: "IMPORT_ALL_MODELS", entities, employees, programs, awards }),
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(AllModelsImport);

interface ProgramsPreviewProps {
    programs: ProgramAwardSheetImport[],
}

const ProgramsPreview: StatelessComponent<ProgramsPreviewProps> = ({ programs }) => {
    return (
        <div className='block-s'>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Program Name</Table.HeaderCell>
                        <Table.HeaderCell>SubProgram Name</Table.HeaderCell>
                        <Table.HeaderCell>Instrument Type</Table.HeaderCell>
                        <Table.HeaderCell>Settlement Type</Table.HeaderCell>
                        <Table.HeaderCell>Performance</Table.HeaderCell>
                        <Table.HeaderCell>Employee ID</Table.HeaderCell>
                        <Table.HeaderCell>Grant Date</Table.HeaderCell>
                        <Table.HeaderCell>Vested Date</Table.HeaderCell>
                        <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Strike</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        programs.map((program, index) =>  {
                            return (
                                <Table.Row key={index}>
                                    <Table.Cell>{program.programName}</Table.Cell>
                                    <Table.Cell>{program.subProgramName}</Table.Cell>
                                    <Table.Cell>{program.instrumentTypeId}</Table.Cell>
                                    <Table.Cell>{program.settlementTypeId}</Table.Cell>
                                    <Table.Cell>{yesOrNo(program.performance)}</Table.Cell>
                                    <Table.Cell>{program.employeeEmail}</Table.Cell>
                                    <Table.Cell>{program.grant_date.format("DD.MM.YY")}</Table.Cell>
                                    <Table.Cell>{program.vested_date.format("DD.MM.YY")}</Table.Cell>
                                    <Table.Cell>{program.expiry_date.format("DD.MM.YY")}</Table.Cell>
                                    <Table.Cell>{program.quantity}</Table.Cell>
                                    <Table.Cell>{program.strike}</Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                </Table.Body>
            </Table>
        </div>
    )
};
