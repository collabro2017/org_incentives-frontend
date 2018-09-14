import React, { StatelessComponent } from "react";
import { Dividend } from "./dividend-reducer";
import { Message, Table } from "semantic-ui-react";
import { formatLongDate, formatSharePrice } from "../../utils/utils";

interface Props {
    dividends: Dividend[]
}

const ViewAllDividends: StatelessComponent<Props> = ({ dividends }) => dividends.length === 0 ? <NoDividends /> : (
    <div>
        <Table celled padded>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Dividend date</Table.HeaderCell>
                    <Table.HeaderCell>Dividend per share</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    dividends.map((dividend, index) => {
                        return (
                            <Table.Row key={index}>
                                <Table.Cell>{formatLongDate(dividend.dividend_date)}</Table.Cell>
                                <Table.Cell>{formatSharePrice(parseFloat(dividend.dividend_per_share))}</Table.Cell>
                            </Table.Row>
                        );
                    })
                }
            </Table.Body>
        </Table>
    </div>
);


const NoDividends: StatelessComponent = () => (
    <Message
        header='No dividends'
        content='There are no dividends registered yet'
    />
);

export default ViewAllDividends;
