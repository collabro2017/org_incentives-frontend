import React, { Component } from "react";
import { Modal, Header, Icon, Button, Message } from "semantic-ui-react";
import { replace } from "react-router-redux";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { Link } from "react-router-dom";
import { purchaseRoute } from "../menu/menu";
import { RootState } from "../reducers/all-reducers";
import { APIPurchaseOpportunity } from "../instruments/instruments-reducer";
import { Redirect } from "react-router";
import { capitalizeFirstLetter, formatCurrency2Decimals, formatNumber } from "../utils/utils";
import { PurchaseWindow } from "../data/data";
import { InstrumentType, instrumentTypeText } from "../utils/text-mappings";

interface DispatchProps {
    redirectToRoot: () => void,
}

interface StateProps {
    purchase_opportunity?: APIPurchaseOpportunity,
    purchaseWindow?: PurchaseWindow,
    companyName: string,
    tenantId: string,

}

class PurchaseAvailableModal extends Component<DispatchProps & StateProps> {
    render() {
        const { purchase_opportunity, purchaseWindow } = this.props;
        if (!purchaseWindow || !purchase_opportunity || purchase_opportunity.purchasedAmount >= purchase_opportunity.maximumAmount) {
            return <Redirect to={"/"}/>
        }

        const purhcaseableInstruments = purchase_opportunity.maximumAmount - purchase_opportunity.purchasedAmount;

        const instrumentTerm = instrumentTypeText(InstrumentType[purchase_opportunity.instrument.toUpperCase()]).plural;
        const instrumentTermSingular = instrumentTypeText(InstrumentType[purchase_opportunity.instrument.toUpperCase()]).singular;
        const { companyName, tenantId } = this.props;
        return (
            <Modal open closeIcon={<Icon name="close" />} onClose={this.props.redirectToRoot} >
                <Header content={`Congratulations, you have ${instrumentTerm} available for purchase!`} textAlign={"center"}/>
                <Modal.Content>
                    <p className="text-center text-content-center block-xs">
                        A total number of {formatNumber(purhcaseableInstruments)} {capitalizeFirstLetter(instrumentTerm)} are available for purchase at a price of {formatCurrency2Decimals(parseFloat(purchase_opportunity.price))} per {capitalizeFirstLetter(instrumentTermSingular)}.
                    </p>
                    <p className="text-center text-content-center block-xs">
                        Use the portal to accept the general terms and conditions and register your purchase.
                    </p>
                    <p className="text-center text-content-center block-m">
                        The purchase window closes at {purchaseWindow.to.format("lll")}
                    </p>
                    <div className="text-content-center block-xs">
                        {
                            tenantId && tenantId === 'd1d001c5-f818-41e6-92f4-b1727eef8f36' &&
                            <Message>
                                <Message.Header>With reference to the Long Term Incentive Programme agreement</Message.Header>
                                <Message.Content>
                                    <div className="block-xs">
                                        {`Personal data submitted to ${companyName}, e.g. contact details and personal identity number, or otherwise registered in connection with the administration of the Plan, is processed by ${companyName}, as the data controller, for the administration of the Plan. The processing of personal data is necessary for ${companyName} in order to fulfill the agreement concerning the Plan and to enable ${companyName} to fulfill its statutory obligations. As a tool for processing these data, ${companyName} might use the services of a Third Party. Please read the Long Term Incentive Programme 2018 Document in full for all details regarding the Plan and Personal Data Information.`}
                                    </div>
                                    <div><a href="https://www.tobii.com/group/privacy-policy/" target="_blank">Link to the Tobii privacy policy</a></div>
                                </Message.Content>
                            </Message>
                        }
                    </div>
                </Modal.Content>
                <Modal.Actions >
                    <div className="text-center">
                        <Button onClick={this.props.redirectToRoot}>
                            Return to portal
                        </Button>
                        <Link to={purchaseRoute}>
                            <Button color='green'>
                                Start purchase process
                            </Button>
                        </Link>
                    </div>
                </Modal.Actions>
            </Modal>
        )
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ user }) => ({
    purchase_opportunity: user.currentPurchaseWindow && user.currentPurchaseWindow.purchase_opportunity,
    purchaseWindow: user.currentPurchaseWindow,
    companyName: user.tenant && user.tenant.name,
    tenantId: user.tenant && user.tenant.id,

});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, null> = (dispatch => ({
    redirectToRoot: () => dispatch(replace("/")),
}));

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseAvailableModal);
