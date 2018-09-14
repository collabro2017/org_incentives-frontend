import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Button, Dropdown, DropdownItemProps, Form} from "semantic-ui-react";
import {changePunctuationForComma, norwegianLongDate, norwegianShortDate} from "../../../utils/utils";
import moment from "moment";

enum FormFieldType {
    STRING = "STRING", SELECT = "SELECT"
}


interface FormField {
    type: string,
    label: string,
    objectKey: string,
}

const formFields: FormField[] = [
    {
        type: FormFieldType.SELECT,
        label: "",
        objectKey: ""
    }
];

export enum AdjustmentType {
    ADJUSTMENT_VESTING_DATE = "ADJUSTMENT_VESTING_DATE", ADJUSTMENT_STRIKE = "ADJUSTMENT_STRIKE"
}

interface Props {
    handleTextChange: (event, {name, value}) => void,
    transactionType: string,
    transactionDate: string,
    vestingDate: string,
    fair_value: string,
    strike: string,
}

const transactionTypeOptions: DropdownItemProps[] = [
    {
        key: AdjustmentType.ADJUSTMENT_VESTING_DATE.toString(),
        value: AdjustmentType.ADJUSTMENT_VESTING_DATE.toString(),
        text: AdjustmentType.ADJUSTMENT_VESTING_DATE.toString(),
    },
    {
        key: AdjustmentType.ADJUSTMENT_STRIKE.toString(),
        value: AdjustmentType.ADJUSTMENT_STRIKE.toString(),
        text: AdjustmentType.ADJUSTMENT_STRIKE.toString(),
    }
];

export class CreateTransactionForm extends Component<Props> {
    render() {
        const {handleTextChange, transactionType, vestingDate, fair_value, transactionDate, strike } = this.props;
        return (
            <div>
                <Form size={'large'}>
                    <Form.Field width={5}>
                        <label>Transaction date (dd.mm.yy)</label>
                        <Form.Input
                            placeholder={'Date (dd.mm.yy)'}
                            value={transactionDate}
                            name="transactionDate"
                            onChange={handleTextChange}/>
                    </Form.Field>
                    <Form.Field width={5}>
                        <label>Transaction Type</label>
                        <Dropdown placeholder='Select transaction type' fluid selection
                                  options={transactionTypeOptions}
                                  name={"transactionType"}
                                  value={transactionType} onChange={handleTextChange}>
                        </Dropdown>
                    </Form.Field>
                    {
                        AdjustmentType[transactionType] === AdjustmentType.ADJUSTMENT_VESTING_DATE &&
                        <div className="block-m">
                            <div className="block-s">
                                <Form.Field width={5}>
                                    <label>New vesting date (dd.mm.yy)</label>
                                    <Form.Input
                                        placeholder={'Date (dd.mm.yy)'}
                                        value={vestingDate}
                                        name="vestingDate"
                                        onChange={handleTextChange}/>
                                </Form.Field>
                                <Form.Field>
                                    <label>Fair value diff (leave blank if report should be unaffected)</label>
                                    <Form.Input
                                        value={fair_value}
                                        onChange={handleTextChange}
                                        placeholder={'Fair value'}
                                        name={"fair_value"}
                                    />
                                </Form.Field>
                            </div>
                        </div>
                    }
                    {
                        AdjustmentType[transactionType] === AdjustmentType.ADJUSTMENT_STRIKE &&
                        <div className="block-m">
                            <div className="block-s">
                                <Form.Field width={5}>
                                    <label>New strike</label>
                                    <Form.Input
                                        value={strike}
                                        onChange={handleTextChange}
                                        placeholder={'Strike'}
                                        name={"strike"}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Fair value diff (leave blank if report should be unaffected)</label>
                                    <Form.Input
                                        value={fair_value}
                                        onChange={handleTextChange}
                                        placeholder={'Fair value'}
                                        name={"fair_value"}
                                    />
                                </Form.Field>
                            </div>
                        </div>
                    }
                </Form>
            </div>
        );
    }
}
