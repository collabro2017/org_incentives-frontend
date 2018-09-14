import React, { Component } from "react";
import { Loader } from 'semantic-ui-react';
import { match, Route, Switch } from "react-router";
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Overview from "./overview";
import { default as ExerciseRouter, SharePrice } from "../exercise/exercise-router";
import PurchaseRouter from "../purchase/purchase-router";
import { Window } from "../data/data";
import InstrumentsPage from '../instruments/instruments-page';
import GeneralErrorModal from "../error/general-error-modal";
import OrderPage from "../exercise/order/order-page";
import FAQPage from "../support/faq-page";
import { Features } from "../features/features-reducer";
import { Tenant } from "../tenant/tenant-reducer";
import { RootState } from "../reducers/all-reducers";
import { IntlProvider } from "react-intl";
import { IStringStringMap } from "../texts/employee-portal-texts-reducer";
import { documentsRoute, exerciseRoute, purchaseRoute } from "../menu/menu";
import DocumentsPage from "../documents/view-documents/documents-page";
import PurchaseAvailableModal from "../purchase/purchase-available-modal";
import AcceptDocumentsModal from "../documents/accept-documents/accept-documents-modal";

interface StateProps {
    isFetchingInitialData: boolean,
    currentExerciseWindow?: Window,
    currentPurchaseWindow?: Window,
    features: Features,
    errorFetchingWelcomeData?: boolean,
    sharePrice: SharePrice,
    tenant: Tenant,
    messages: IStringStringMap,
}

interface DispatchProps {
    fetchWelcomeData: () => void
}

interface Props {
    companyName: string,
    match: match<{}>,
}

class EmployeePortalRouter extends Component<StateProps & Props & DispatchProps, {}> {
    componentWillMount() {
        if (!this.props.sharePrice) {
            this.props.fetchWelcomeData();
        }
    }

    render() {
        if (this.props.errorFetchingWelcomeData) {
            return <GeneralErrorModal />
        }

        if (this.props.isFetchingInitialData || !this.props.sharePrice) {
            return (
                <div className="loader-container"><Loader active={true} size='big' /></div>
            )
        }

        const { companyName, sharePrice, currentExerciseWindow, currentPurchaseWindow, features } = this.props;

        return (
            <IntlProvider locale="en" messages={this.props.messages}>
                <Switch>
                    <Route path={`/orders`} render={({ match, location }) => (
                        <OrderPage refreshWelcomeData={this.props.fetchWelcomeData} />
                    )} />

                    <Route path={`/instruments`} render={({ match }) => (
                        <InstrumentsPage match={match} />
                    )} />

                    <Route path={exerciseRoute} render={({ match }) => (
                        <ExerciseRouter window={currentExerciseWindow} match={match}
                                        sharePrice={sharePrice} />
                    )} />
                    <Route path={purchaseRoute} render={({ match }) => (
                        <PurchaseRouter window={currentPurchaseWindow} match={match} />
                    )} />
                    <Route path={`/help`} render={({ match }) => (
                        <FAQPage />
                    )} />
                    {
                        features.documents &&
                        <Route path={documentsRoute} render={({ match }) => (
                            <DocumentsPage />
                        )} />
                    }
                    <Route path="/" render={() =>
                        <div>
                            <Route path="/purchasepopup" render={({ match }) => (
                                <PurchaseAvailableModal />
                            )} />
                            <Route path="/acceptdocuments" render={({ match }) => (
                                <AcceptDocumentsModal />
                            )} />
                            <Overview companyName={companyName} />
                        </div>
                    } />
                </Switch>
            </IntlProvider>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, Props, RootState> = ({ user, tenant, instrument, features, employeePortalTexts }): StateProps => ({
    isFetchingInitialData: instrument.isFetchingWelcomeData,
    errorFetchingWelcomeData: instrument.errorFetchingWelcomeData,
    currentExerciseWindow: user.currentExerciseWindow,
    currentPurchaseWindow: user.currentPurchaseWindow,
    sharePrice: instrument.sharePrice,
    tenant: user.tenant,
    features,
    messages: employeePortalTexts.messages,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch): DispatchProps => ({
    fetchWelcomeData: () => dispatch({ type: 'FETCH_EMPLOYEE_PORTAL_WELCOME' }),
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(EmployeePortalRouter);
