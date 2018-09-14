import React, { StatelessComponent } from 'react';
import moment from "moment";
import { Table } from 'semantic-ui-react';
import { formatPercentage } from "../utils/utils";
import { VestingEventTemplate } from "./subprogram-reducer";

interface Props {
    vestingTemplates: VestingEventTemplate[],
}

const SubProgramVestingPreview: StatelessComponent<Props> = ({ vestingTemplates }) => {

    console.log(vestingTemplates);

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Grant Date</Table.HeaderCell>
                    <Table.HeaderCell>Vested Date</Table.HeaderCell>
                    <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                    <Table.HeaderCell>Strike</Table.HeaderCell>
                    {
                        vestingTemplates.some((vs) => !!vs.purchase_price) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                    }
                    <Table.HeaderCell>Quantity %</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    vestingTemplates.map((vesting, index) => {
                        return (
                            <Table.Row key={index}>
                                <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                <Table.Cell>{vesting.strike.replace('.', ',')}</Table.Cell>
                                {
                                    vestingTemplates.some((vs) => !!vs.purchase_price) && <Table.Cell>{vesting.purchase_price}</Table.Cell>
                                }
                                <Table.Cell>{formatPercentage(vesting.quantityPercentage)}</Table.Cell>
                            </Table.Row>
                        )
                    })
                }
            </Table.Body>
        </Table>
    )
};

export default SubProgramVestingPreview;