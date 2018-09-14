import React, { StatelessComponent } from "react";
import { Button, Form, Table, Checkbox, Dropdown } from 'semantic-ui-react';
import moment from "moment";

export enum DividendEffect {
    GENERATE_DIVIDEND_INSTRUMENTS = "GENERATE_DIVIDEND_INSTRUMENTS", STRIKE_ADJUSTMENT = "STRIKE_ADJUSTMENT"
}

export interface DividendEffectItem {
    selected: boolean,
    programName: string,
    subprogramName: string,
    sub_program_id: string,
    instrumentType: string,
    dividendEffect: string
}

interface Props {
    handleDateChange: (event, { name, value }) => void,
    handleTextChange: (event, { name, value }) => void,
    dividend_per_share: string,
    share_price_at_dividend_date: string,
    dividend_date: string,
    effects: DividendEffectItem[],
    allSelected: boolean,
    effectChanged: (index: number, event, { value }) => void,
    effectToggle: (index: number) => void,
    toggleSelectAll: () => void
}

const CreateDividendForm: StatelessComponent<Props> = ({ handleDateChange, handleTextChange, dividend_per_share, dividend_date, effects, allSelected, effectChanged, effectToggle, toggleSelectAll, share_price_at_dividend_date }) => (
    <Form size={'large'}>
        <Form.Field width={7}>
            <label>Dividend Date (dd.mm.yy)</label>
            <Form.Input
                placeholder={'Dividend Date (dd.mm.yy)'}
                value={dividend_date}
                name="dividend_date"
                onChange={handleDateChange} />
        </Form.Field>
        <Form.Field width={4}>
            <label>Dividend per share</label>
            <Form.Input
                placeholder={'Dividend per share'}
                value={dividend_per_share}
                name="dividend_per_share"
                onChange={handleTextChange} />
        </Form.Field>
        <Form.Field width={4}>
            <label>Share price at dividend date</label>
            <Form.Input
                placeholder={'Share price'}
                value={share_price_at_dividend_date}
                name="share_price_at_dividend_date"
                onChange={handleTextChange} />
        </Form.Field>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>
                        {/*<Checkbox onChange={toggleSelectAll}*/}
                                  {/*checked={allSelected} />*/}
                    </Table.HeaderCell>
                    <Table.HeaderCell>Program</Table.HeaderCell>
                    <Table.HeaderCell>Sub program</Table.HeaderCell>
                    <Table.HeaderCell>Instrument Type</Table.HeaderCell>
                    <Table.HeaderCell>Dividend Effect</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    effects.map((effect, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>{<Checkbox onChange={effectToggle.bind(this, index)}
                                                   checked={allSelected || effect.selected} />}</Table.Cell>
                            <Table.Cell>{effect.programName}</Table.Cell>
                            <Table.Cell>{effect.subprogramName}</Table.Cell>
                            <Table.Cell>{effect.instrumentType}</Table.Cell>
                            <Table.Cell>
                                <Form.Field>
                                    <Dropdown options={dividendEffectOptions}
                                              value={effect.dividendEffect}
                                              onChange={effectChanged.bind(this, index)}>
                                    </Dropdown>
                                </Form.Field>
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    </Form>
);

export const dividendEffectOptions = [
    {
        key: DividendEffect.GENERATE_DIVIDEND_INSTRUMENTS,
        value: DividendEffect.GENERATE_DIVIDEND_INSTRUMENTS,
        text: 'Generate Dividend Instruments'
    },
    {
        key: DividendEffect.STRIKE_ADJUSTMENT,
        value: DividendEffect.STRIKE_ADJUSTMENT,
        text: 'Strike Adjustment'
    },
];


export default CreateDividendForm;
