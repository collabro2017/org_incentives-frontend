import React, { Component } from 'react';
import {
    BrowserRouter,
    Route,
    Switch
} from 'react-router-dom';
import Footer from './footer/footer';
import RequireAuth from "./auth/require-auth";
import Menu, { exerciseRoute, purchaseRoute } from './menu/menu';
import SysadminMenu from './menu/sysadmin-menu';
import EmployeePortalRouter from './employee-portal/employee-portal-router';
import { ConnectedRouter } from 'react-router-redux'
import Logout from "./auth/logout-page";
import LoggedInCallback from "./auth/logged-in";
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import ExerciseBanner from './exercise/exercise-banner';
import LoginPage from "./auth/login-page";
import { RootState } from "./reducers/all-reducers";
import AdminRouter from "./admin-router/admin-router";
import { History } from "history";
import PurchaseBanner from "./purchase/purchase-banner";
import InvertedRoute from "./utils/inverted-route";

interface StateProps {
    isSysadmin: boolean,
    companyName?: string,
    name?: string,
}

interface Props {
    history: History
}

class Router extends Component<StateProps & Props> {
    render() {
        const { companyName, name, isSysadmin, history } = this.props;

        return (
            <ConnectedRouter history={history}>
                <Switch>
                    <Route exact path='/login' render={() => <LoginPage />} />
                    <Route exact path='/loggedin' render={(props) => <LoggedInCallback {...props} />} />
                    <Route exact path='/logout' render={() => <Logout />} />
                    <Route path="/" render={({ match }) => (
                        <RequireAuth>
                            <div>
                                {isSysadmin && <SysadminMenu />}
                                <Menu userName={name} />
                                <InvertedRoute showOnEveryRouteExcept={exerciseRoute} render={() => <ExerciseBanner />} />
                                <InvertedRoute showOnEveryRouteExcept={purchaseRoute} render={() => <PurchaseBanner />} />
                                <div className="content-wrapper">
                                    <Switch>
                                        <Route path="/admin" render={({ match }) => (
                                            <AdminRouter match={match} companyName={companyName} />
                                        )} />
                                        <Route path="/" render={({ match }) => (
                                            <EmployeePortalRouter match={match} companyName={companyName} />
                                        )} />
                                    </Switch>
                                </div>
                                <Footer />
                            </div>
                        </RequireAuth>
                    )} />
                </Switch>
            </ConnectedRouter>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ user }): StateProps => ({
    isSysadmin: user.isSysadmin,
    companyName: user.tenant && user.tenant.name,
    name: user.name,
});

export default connect<StateProps>(mapStateToProps)(Router);
