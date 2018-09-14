import React, { Component } from 'react';
import { Button, Form, Message, Checkbox } from 'semantic-ui-react';
import Content from "../../texts/content";
import { formatCurrency, formatCurrency2Decimals, formatNumber } from "../../utils/utils";
import { InstrumentType, instrumentTypeText } from "../../utils/text-mappings";
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface Props {
    shareDepositoryAccountNumber: string,
    shareDepositoryNotAvailable: boolean,
    shareDepositoryError: boolean,
    goBack: () => void;
    goForward: () => void;
    onVPSAccountNumberChanged: (value: string) => void,
    handleShareDepositoryNotAvailableToggle: () => void,
    instrument: InstrumentType,
}


class ShareDepository extends Component<Props & InjectedIntlProps, {}> {
    render() {
        const { shareDepositoryAccountNumber, shareDepositoryNotAvailable, shareDepositoryError, instrument, intl: { formatMessage  } } = this.props;
        const instrumentTerm = instrumentTypeText(instrument);
        return (
            <div>
                <div className="section-container block-l">
                    <h2 className="text-center block-m">
                        <Content
                            id="purchase.sharedepository.header"
                            values={{ instrumentTermPlural: instrumentTerm.plural }}
                        />
                    </h2>
                    <p className="text-content text-content-center block-m text-center">
                        <Content
                            id="purchase.sharedepository.body"
                        />
                    </p>
                    <div className='vps-number block-l'>
                        <Form size={"large"}>
                            <Form.Field>
                                <label><Content id="exercise.type.sharedepositoryaccount.label"/></label>
                                <input placeholder={formatMessage({ id: "exercise.type.sharedepositoryaccount.placeholder"})}
                                       value={shareDepositoryAccountNumber}
                                       disabled={shareDepositoryNotAvailable}
                                       onChange={this.handleVPSChange} />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label={formatMessage({ id: "exercise.type.sharedepositoryaccount.checkbox.label"})}
                                          checked={shareDepositoryNotAvailable}
                                          onChange={this.props.handleShareDepositoryNotAvailableToggle} />
                            </Form.Field>
                        </Form>
                    </div>
                </div>

                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='Next' icon='right arrow' labelPosition='right' size="big"
                            disabled={shareDepositoryError}
                            onClick={this.props.goForward} />
                </div>
            </div>
        );
    }
    private handleVPSChange = (event) => {
        this.props.onVPSAccountNumberChanged(event.target.value);
    };

}

export default injectIntl<Props>(ShareDepository);