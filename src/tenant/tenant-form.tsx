import React, { Component } from 'react';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import {Tenant} from "./tenant-reducer";

interface Props {
    actionButtonOnClick: (tenant: Tenant) => void,
    closeForm: () => void,
    actionButtonTitle: string,
    defaultValues?: Tenant,
}

interface State {
    name: string,
    logoUrl: string,
    bankAccountNumber: string,
    bic_number: string,
    iban_number: string,
    currency_code: string,
    payment_address: string,
    comment: string,
    feature: {
        exercise: boolean,
        documents: boolean,
        purchase: boolean,
    }
}

class TenantForm extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = props.defaultValues ? this.stateFromTenantObject(props.defaultValues) : this.emptyFormState();
    }

    render() {
        const { name, logoUrl, feature, bankAccountNumber, bic_number, iban_number, currency_code, payment_address, comment } = this.state;

        return (
            <div className={"width-limit"}>
                <div className='form-greyscale'>
                    <Form size={'large'}>
                        <Form.Field width={10}>
                            <label>Company name</label>
                            <Form.Input placeholder='Company name' value={name} name={'name'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>Company logo url</label>
                            <Form.Input placeholder='Company logo url' value={logoUrl} name={'logoUrl'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>Currency code</label>
                            <Form.Input placeholder='Currency code' value={currency_code} name={'currency_code'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>Account number</label>
                            <Form.Input placeholder='Account number' value={bankAccountNumber} name={'bankAccountNumber'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>BIC number</label>
                            <Form.Input placeholder='BIC number' value={bic_number} name={'bic_number'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>IBAN number</label>
                            <Form.Input placeholder='IBAN number' value={iban_number} name={'iban_number'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <Form.TextArea label='Payment address' value={payment_address} name={'payment_address'} onChange={this.handleInputChange} cols={30} rows={5}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <Form.TextArea label='Comment' value={comment} name={'comment'} onChange={this.handleInputChange} cols={30} rows={5}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <Checkbox label='Exercise' checked={feature.exercise} name={'exercise'} onChange={this.handleToggleChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <Checkbox label='Documents' checked={feature.documents} name={'documents'} onChange={this.handleToggleChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <Checkbox label='Purchase' checked={feature.purchase} name={'purchase'} onChange={this.handleToggleChange}/>
                        </Form.Field>
                        <div className='text-center'>
                            <Button.Group>
                                <Button type='button' onClick={this.props.closeForm}>Cancel</Button>
                                <Button.Or/>
                                <Button positive type='submit' onClick={this.onClick}>{this.props.actionButtonTitle}</Button>
                            </Button.Group>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }

    private handleInputChange = (event, { name, value }) => {
        this.setState({ [name]: value })
    };

    private handleToggleChange = (event, { name, value }) => {
        this.setState({ feature: { ...this.state.feature, ...{ [name]: !this.state.feature[name] } } })
    };

    private onClick = () => {
        const tenant: Tenant = {
            name: this.state.name,
            logo_url: this.state.logoUrl,
            bank_account_number: this.state.bankAccountNumber,
            bic_number: this.state.bic_number,
            iban_number: this.state.iban_number,
            currency_code: this.state.currency_code.toUpperCase(),
            payment_address: this.state.payment_address,
            comment: this.state.comment,
            feature: {
                exercise: this.state.feature.exercise,
                documents: this.state.feature.documents,
                purchase: this.state.feature.purchase
            }
        };

        this.props.actionButtonOnClick(tenant);
    };

    private emptyFormState = (): State => ({
        name: '',
        logoUrl: '',
        bankAccountNumber: '',
        bic_number: '',
        iban_number: '',
        currency_code: 'NOK',
        payment_address: '',
        comment: '',
        feature: {
            exercise: false,
            documents: false,
            purchase: false,
        }
    });

    private stateFromTenantObject = (tenant: Tenant): State => ({
        name: tenant.name,
        logoUrl: tenant.logo_url,
        bankAccountNumber: tenant.bank_account_number || '',
        bic_number: tenant.bic_number || '',
        iban_number: tenant.iban_number || '',
        currency_code: tenant.currency_code || 'NOK',
        payment_address: tenant.payment_address || '',
        comment: tenant.comment || '',
        feature: {
            exercise: tenant.feature && tenant.feature.exercise,
            documents: tenant.feature && tenant.feature.documents,
            purchase: tenant.feature && tenant.feature.purchase,
        }
    });
}


export default TenantForm;
