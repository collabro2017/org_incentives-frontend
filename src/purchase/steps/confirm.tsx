import React, { StatelessComponent } from "react";
import Content from "../../texts/content";
import { Button, Message } from "semantic-ui-react";
import { formatCurrency, formatCurrency2Decimals, formatNumber } from "../../utils/utils";
import { BICAndIBAN, PaymentAddress } from "../../exercise/overview-and-confirm";
import numeral from "numeral";
import { Moment } from "moment";
import { PaymentInfo } from "../purchase-router";
import { InstrumentType, instrumentTypeText } from "../../utils/text-mappings";

interface Props {
    placeOrder: () => void,
    goBack: () => void,
    isPlacingOrder: boolean,
    quantity: number,
    pricePerInstrument: number,
    paymentInfo: PaymentInfo,
    instrument: InstrumentType,
}

const ConfirmPurchase: StatelessComponent<Props> = ({ goBack, placeOrder, isPlacingOrder, quantity, pricePerInstrument, paymentInfo, instrument }) => (
    <div>
        <div className="section-container block-l">
            <h2 className="text-center block-m"><Content id="purchase.confirm.header"/></h2>
            <p className="text-content text-content-center block-s">
                <Content
                    id="purchase.confirm.body.1"
                    values={{
                        pricePerInstrument: formatCurrency2Decimals(pricePerInstrument),
                        numberOfInstruments: formatNumber(quantity),
                        totalAmount: formatCurrency2Decimals(pricePerInstrument * quantity),
                        instrumentTermPlural: instrumentTypeText(instrument).plural,
                        instrumentTermSingular: instrumentTypeText(instrument).singular,
                    }}
                />
            </p>
            <p className="text-content text-content-center block-m">
                <Content
                    id="purchase.confirm.body.2"
                    values={{
                        pricePerInstrument: formatCurrency2Decimals(pricePerInstrument),
                        numberOfInstruments: formatNumber(quantity),
                        totalAmount: formatCurrency2Decimals(pricePerInstrument * quantity),
                        instrumentTermPlural: instrumentTypeText(instrument).plural,
                        instrumentTermSingular: instrumentTypeText(instrument).singular,
                    }}
                />
            </p>
            <PaymentInfo
                totalPrice={pricePerInstrument * quantity}
                bankAccountNumber={paymentInfo.bankAccountNumber}
                iban_number={paymentInfo.iban_number}
                bic_number={paymentInfo.bic_number}
                paymentDeadline={paymentInfo.paymentDeadline}
                address={<PaymentAddress addressString={paymentInfo.address}/>}
            />
        </div>
        <div className="section-container page-action-container text-center">
            <Button content='Back' size="big" onClick={goBack} />
            <Button positive content='Confirm purchase order' icon='right arrow' labelPosition='right' size="big" onClick={placeOrder} />
        </div>
    </div>
);

export interface PaymentInfoProps {
    bankAccountNumber?: string,
    bic_number?: string,
    iban_number?: string,
    totalPrice: number,
    address?: React.ReactElement<any>,
    paymentDeadline: Moment,
}


const PaymentInfo: StatelessComponent<PaymentInfoProps> = ({ totalPrice, bankAccountNumber, bic_number, iban_number, address, paymentDeadline }) => (
    <div className="text-content-center block-m">
        <Message info>
            <Message.Content>
                <Message.Header><Content id="payment.header"/></Message.Header>
                <div className="block-s">
                    <Content
                        id="purchase.confirm.description"
                        values={{
                            totalPrice: formatCurrency2Decimals(totalPrice),
                            transferDeadline: paymentDeadline.format('lll')
                        }}
                    />
                </div>
                <div className="block-s">
                    <div className="block-xxs"><strong><Content id="payment.domestic.account.header"/></strong></div>
                    <div>
                        <Content
                            id={bankAccountNumber ? "payment.domestic.account.description" : 'payment.domestic.noaccount.description'}
                            values={{ bankAccountNumber }}
                        />
                    </div>
                </div>

                <div className="block-s">
                    <div className="block-xxs"><strong><Content id="payment.foreign.account.header"/></strong></div>
                    {
                        bic_number && iban_number ?
                            <BICAndIBAN bic={bic_number} iban={iban_number}/> :
                            <div className="block-xxs"><Content id="payment.foreign.noaccount.description"/></div>
                    }
                    { address }
                </div>
            </Message.Content>
        </Message>
    </div>
);


export default ConfirmPurchase;
