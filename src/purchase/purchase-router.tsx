import React, { Component, StatelessComponent } from 'react';
import moment, { Moment } from "moment";
import { Window, InstrumentsAgreement } from "../data/data";
import { Table, Loader, Form, Button, Modal, Dimmer, Step } from 'semantic-ui-react';
import { connect, MapStateToProps, MapDispatchToProps } from 'react-redux';
import {
    Route,
    Link,
    Redirect
} from 'react-router-dom';
import { APIPurchaseOpportunity, ExercisibleInstrumentsTerm, FlatAward } from "../instruments/instruments-reducer";
import { ErrorModal } from "../error/general-error-modal";
import FormattedMessageWrapper, { default as Content } from "../texts/content";
import { RootState } from "../reducers/all-reducers";
import { default as StepIndicator, StepIndicatorData } from "./purchase-step-indicator";
import AcceptDocument from "./steps/accept-document";
import { push } from "react-router-redux";
import Quantity from "./steps/quantity";
import ConfirmPurchase, { PaymentInfoProps } from "./steps/confirm";
import { default as ExerciseNotPossiblePage, ExerciseNotPossibleReason } from "../exercise/exercise-not-possible-page";
import PurchaseNotPossiblePage, { PurchaseNotPossibleReason } from "./purchase-not-possible-page";
import { CREATE_PURCHASE_ORDER, FETCH_PURCHASE_DOCUMENT, REMOVE_PURCHASE_ORDER_ERROR } from "./duck/purchase-actions";
import { DocumentMetadata } from "./duck/purchase-reducer";
import SpinnerInline from "../common/components/spinner-inline";
import SpinnerFullScreen from "../common/components/spinner-full-screen";
import { InstrumentType, instrumentTypeText } from "../utils/text-mappings";
import { capitalizeFirstLetter } from "../utils/utils";
import ShareDepository from "./steps/share-depository";

interface CreatePurchaseOrderData {

}

interface Props {
    window: Window,
    match: any,
}

interface StateProps {
    purchaseOpportunity?: APIPurchaseOpportunity,
    purchaseDocument: DocumentMetadata,
    isFetchingPurchaseDocument: boolean,
    paymentInfo: PaymentInfo,
    isPlacingOrder: boolean,
    purchaseError: boolean
}

export interface PaymentInfo {
    bankAccountNumber?: string,
    bic_number?: string,
    iban_number?: string,
    address?: string,
    paymentDeadline?: Moment,
}

interface DispatchProps {
    backToFrontPage: () => void,
    fetchDocumentInfo: (documentId: string) => void,
    placeOrder: (purchase_amount: number, purchase_opportunity_id: string, share_depository_account: string | undefined) => void,
    removeOrderErrorMessage: () => void,
}

interface State {
    currentPage: PurchaseStep,
    quantityError: boolean,
    purchaseQuantity: string,
    hasDownloadedDocument: boolean,
    shareDepositoryAccountNumber: string,
    shareDepositoryNotAvailable: boolean,
    shareDepositoryError: boolean,
}

enum PurchaseStep {
    DOCUMENT = 0, QUANTITY = 1, SHARE_DEPOSITORY = 2, CONFIRM = 3
}

const steps = (activeStep: number, showShareDepositoryStep: boolean): StepIndicatorData[] => ([
    {
        title: "Purchase Agreement",
        description: "Read and accept purchase terms",
    },
    {
        title: "Quantity",
        description: "Choose purchase quantity",
    },
    {
        title: "Securities Account",
    },
    {
        title: "Confirm order",
    },
])
    .map((x, index) => ({ ...x, clickable: index < activeStep, active: index === activeStep, completed: index < activeStep }))
    .filter((step, index) => showShareDepositoryStep || index !== 2);


class PurchaseRouter extends Component<Props & StateProps & DispatchProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: PurchaseStep.DOCUMENT,
            quantityError: false,
            purchaseQuantity: this.purchasableQuantity().toString(),
            hasDownloadedDocument: false,
            shareDepositoryAccountNumber: '',
            shareDepositoryNotAvailable: false,
            shareDepositoryError: true,
        }
    }

    componentDidMount() {
        if (this.props.purchaseOpportunity) {
            this.props.fetchDocumentInfo(this.props.purchaseOpportunity.documentId)
        }
    }

    render() {
        const { window, purchaseOpportunity, isFetchingPurchaseDocument, purchaseDocument, paymentInfo, isPlacingOrder } = this.props;

        if (!purchaseOpportunity) {
            return <PurchaseNotPossiblePage reason={PurchaseNotPossibleReason.NO_PURCHASABLE_INSTRUMENTS} />
        }

        if (!window) {
            return <PurchaseNotPossiblePage reason={PurchaseNotPossibleReason.NOT_IN_A_PURCHASE_WINDOW} />
        }

        if (isFetchingPurchaseDocument || !purchaseDocument) {
            return <SpinnerInline active/>
        }

        const purchasePrice = parseFloat(purchaseOpportunity.price);
        const instrumentType = InstrumentType[purchaseOpportunity.instrument.toUpperCase()];
        const instrumentTerm = instrumentTypeText(InstrumentType[purchaseOpportunity.instrument.toUpperCase()]);
        const { showShareDepository } = purchaseOpportunity;
        return (
            <div className="main-content">
                {
                    this.props.purchaseError &&
                    <ErrorModal message={'An error occurred while placing your order. Please contact us if the issue persists'} renderActions={() =>
                        <Button primary basic size={"big"} content="OK" onClick={this.props.removeOrderErrorMessage} />
                    } />
                }
                <h1 className="block-m">
                    <Content id="purchase.title" values={{ instrumentTermPlural: capitalizeFirstLetter(instrumentTerm.plural) }}/>
                </h1>
                <div className="col-center block-l">
                    <StepIndicator data={steps(this.state.currentPage, showShareDepository)} onClick={this.handleStepIndicatorClick} activeIndex={this.state.currentPage}/>
                </div>
                {
                    isPlacingOrder && <SpinnerFullScreen text="Placing order" active />
                }
                {
                    this.state.currentPage === PurchaseStep.DOCUMENT &&
                    <AcceptDocument
                        goForward={() => this.setState({ currentPage: PurchaseStep.QUANTITY })}
                        goBack={this.props.backToFrontPage}
                        downloadClicked={() => this.setState({ hasDownloadedDocument: true })}
                        document={this.props.purchaseDocument}
                        enableProceedButton={this.state.hasDownloadedDocument}
                        instrumentTerm={instrumentTerm}
                    />
                }
                {
                    this.state.currentPage === PurchaseStep.QUANTITY &&
                    <Quantity
                        error={this.state.quantityError}
                        maximumQuantity={this.purchasableQuantity()}
                        quantity={this.state.purchaseQuantity}
                        quantityChanged={this.quantityChanged}
                        goForward={() => this.setState({ currentPage: showShareDepository? PurchaseStep.SHARE_DEPOSITORY : PurchaseStep.CONFIRM })}
                        goBack={() => this.setState({ currentPage: PurchaseStep.DOCUMENT })}
                        price={purchasePrice}
                        instrument={instrumentType}
                    />
                }
                {
                    this.state.currentPage === PurchaseStep.SHARE_DEPOSITORY &&
                    <ShareDepository
                        shareDepositoryAccountNumber={this.state.shareDepositoryAccountNumber}
                        goForward={() => this.setState({ currentPage: PurchaseStep.CONFIRM })}
                        goBack={() => this.setState({ currentPage: PurchaseStep.QUANTITY })}
                        instrument={instrumentType}
                        onVPSAccountNumberChanged={this.onVPSAccountNumberChanged}
                        handleShareDepositoryNotAvailableToggle={this.handleShareDepositoryNotAvailableToggle}
                        shareDepositoryNotAvailable={this.state.shareDepositoryNotAvailable}
                        shareDepositoryError={this.state.shareDepositoryError}
                    />
                }
                {
                    this.state.currentPage === PurchaseStep.CONFIRM &&
                    <ConfirmPurchase
                        quantity={parseFloat(this.state.purchaseQuantity)}
                        goBack={() => this.setState({ currentPage: showShareDepository ? PurchaseStep.SHARE_DEPOSITORY : PurchaseStep.QUANTITY })}
                        isPlacingOrder={false}
                        placeOrder={this.placeOrder}
                        pricePerInstrument={purchasePrice}
                        paymentInfo={paymentInfo}
                        instrument={instrumentType}
                    />
                }
            </div>
        );
    }

    private handleStepIndicatorClick = (index: number) => this.setState({ currentPage: index });
    private quantityChanged = (newValue) => {
        this.setState({ purchaseQuantity: newValue, quantityError: this.quantityInvalid(newValue) });
    };
    private quantityInvalid = (value: string) => isNaN(parseInt(value)) || parseInt(value) > this.props.purchaseOpportunity.maximumAmount;
    private placeOrder = () => this.props.placeOrder(
        parseInt(this.state.purchaseQuantity),
        this.props.purchaseOpportunity.id,
        this.props.purchaseOpportunity.showShareDepository && !this.state.shareDepositoryNotAvailable ? this.state.shareDepositoryAccountNumber : undefined
    );
    private purchasableQuantity = () => this.props.purchaseOpportunity.maximumAmount - this.props.purchaseOpportunity.purchasedAmount;
    private onVPSAccountNumberChanged = (vpsAccountNumber: string) => this.setState({
        shareDepositoryAccountNumber: vpsAccountNumber,
        shareDepositoryError: !this.isShareDepositoryValid(this.state.shareDepositoryNotAvailable, vpsAccountNumber)
    });
    private handleShareDepositoryNotAvailableToggle = () => {
        const newValue = !this.state.shareDepositoryNotAvailable;
        this.setState({ shareDepositoryNotAvailable: newValue, shareDepositoryError: !this.isShareDepositoryValid(newValue, this.state.shareDepositoryAccountNumber) })
    };
    private isShareDepositoryValid = (shareDepositoryNotAvailable: boolean, shareDepositoryAccountNumber: string) => shareDepositoryNotAvailable || (shareDepositoryAccountNumber && shareDepositoryAccountNumber.length && shareDepositoryAccountNumber.length >= 3);
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, null> = (dispatch) => ({
    backToFrontPage: () => dispatch(push("/")),
    removeOrderErrorMessage: () => dispatch({ type: REMOVE_PURCHASE_ORDER_ERROR }),
    fetchDocumentInfo: (documentId: string) => dispatch({ type: FETCH_PURCHASE_DOCUMENT, documentId }),
    placeOrder: (purchase_amount: number, purchase_opportunity_id: string, share_depository_account: string | undefined) => dispatch({ type: CREATE_PURCHASE_ORDER, purchase_amount, purchase_opportunity_id, share_depository_account }),
});

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ order, user, instrument, purchase }): StateProps => ({
    purchaseOpportunity: user.currentPurchaseWindow ? user.currentPurchaseWindow.purchase_opportunity : null,
    isFetchingPurchaseDocument: purchase.isFetchingPurchaseDocument,
    purchaseDocument: purchase.purchaseDocument,
    purchaseError: purchase.purchaseError,
    paymentInfo: {
        bankAccountNumber: user.tenant && user.tenant.bank_account_number,
        bic_number: user.tenant && user.tenant.bic_number,
        iban_number: user.tenant && user.tenant.iban_number,
        address: user.tenant && user.tenant.payment_address,
        paymentDeadline: user.currentPurchaseWindow && user.currentPurchaseWindow.paymentDeadline
    },
    isPlacingOrder: purchase.isPlacingOrder,
});

export default connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(PurchaseRouter);
