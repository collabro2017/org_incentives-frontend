import React, { Component } from "react"
import {connect} from "react-redux";
import {changeCommaForPunctuation, changePunctuationForComma, formatShortDate} from "../utils/utils";
import { Table, Button, Form } from "semantic-ui-react";
import {Moment} from "moment";

interface FairValueInputLine {
    grantDate?: Moment,
    vestedDate?: Moment,
    expiryDate?: Moment,
}

export interface FairValueInputLineState extends FairValueInputLine {
    fair_value: string,
}

interface Props {
    lines: FairValueInputLine[],
    updateFairValues: (values: FairValueInputLineState[]) => void,
}

interface State {
    fair_values: FairValueInputLineState[]
}

class FairValueInput extends Component<Props, State> {
    constructor(props: Props) {
        super();
        this.state = {
            fair_values: props.lines.map((l) => ({ ...l, fair_value: '' }))
        };
    }

    render() {
        return (
            <div>
                <div className="block-m">
                    <Table celled padded sortable compact={"very"}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                <Table.HeaderCell>Fair value</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {
                                this.props.lines.map((line, index) => (
                                    <Table.Row key={index}>
                                        <Table.Cell>{formatShortDate(line.grantDate)}</Table.Cell>
                                        <Table.Cell>{formatShortDate(line.vestedDate)}</Table.Cell>
                                        <Table.Cell>{formatShortDate(line.expiryDate)}</Table.Cell>
                                        <Table.Cell>
                                            <Form.Field>
                                                <Form.Input value={changePunctuationForComma(this.state.fair_values[index].fair_value)} onChange={this.inputChange.bind(this, index)} placeholder={'Fair value'}/>
                                            </Form.Field>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                </div>
                <div className="text-center">
                    <Button positive type='submit' onClick={this.save}>Save</Button>
                </div>
            </div>
        )
    }
    private inputChange = (index, event, { value }) => {
        const newValues = this.state.fair_values.map((v, i) => i === index ? { ...v, fair_value: value } : { ...v });
        this.setState({ fair_values: newValues });
    };

    private save = () => {
        const withPunctuation = this.state.fair_values.map((v) => ({ ...v, fair_value: changeCommaForPunctuation(v.fair_value) }));
        this.props.updateFairValues(withPunctuation);
    }
}

export default FairValueInput;