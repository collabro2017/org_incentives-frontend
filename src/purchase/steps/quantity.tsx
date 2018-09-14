import React, { Component } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import Content from "../../texts/content";
import { formatCurrency, formatCurrency2Decimals, formatNumber } from "../../utils/utils";
import { InstrumentType, instrumentTypeText } from "../../utils/text-mappings";

interface Props {
    quantity: string,
    price: number,
    error: boolean,
    maximumQuantity: number,
    quantityChanged: (newValue: string) => void,
    goBack: () => void;
    goForward: () => void;
    instrument: InstrumentType,
}


class Quantity extends Component<Props, {}> {
    render() {
        const { quantity, error, maximumQuantity, price, instrument } = this.props;
        const quantityNumber = parseInt(quantity, 10);
        return (
            <div>
                <div className="section-container block-l">
                    <h2 className="text-center block-m">
                        How many would you like to purchase?
                    </h2>
                    <p className="text-content text-content-center block-m text-center">
                        <Content
                            id="purchase.quantity.body"
                            values={{
                                price: formatCurrency(price),
                                instrumentTermSingular: instrumentTypeText(instrument).singular,
                            }}
                        />
                    </p>
                    {
                        error &&
                        <div className="text-content-center block-m">
                            <Message
                                header='Errors'
                                error
                                content={`Purchase quantity must be a number less than or equal to the maximum purchasable quantity (${formatNumber(maximumQuantity)})`}
                            />
                        </div>
                    }
                    <Form>
                        <div className="col-center">
                            <Form.Field
                                label={`Purchase quantity (maximum quantity is ${formatNumber(maximumQuantity)})`}
                                control='input'
                                max={maximumQuantity}
                                error={error}
                                value={formatNumber(parseInt(quantity))}
                                onChange={this.onChangeQuantity}
                                style={{ textAlign: "right" }}
                            />
                            {
                                !isNaN(quantityNumber) && <span>Total purchase price: {formatCurrency2Decimals(price * quantityNumber)}</span>
                            }
                        </div>
                    </Form>
                </div>

                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='Next' icon='right arrow' labelPosition='right' size="big"
                            disabled={error} onClick={this.props.goForward} />
                </div>
            </div>
        );
    }

    private onChangeQuantity = (event) => this.props.quantityChanged(event.target.value.replace(/\D/g, ''));
}

export default Quantity;