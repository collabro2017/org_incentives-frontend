import React, { Component } from "react";
import { match, Route, Switch } from "react-router";
import TenantManagementPage from '../tenant/tenant-management-page';
import SharePriceManagementPage from '../share-price/share-price-management-page';
import EntityManagementPage from '../entity/entity-management-page';
import EmployeeManagementPage from '../employees/employee-management-page';
import ProgramManagementPage from '../programs/program-management-page';
import TextManagementPage from '../texts/text-management-page';
import EntityWorkflow from "../entity/entity-workflow";
import ManagePage from '../manage/manage-page';
import OrdersManagementPage from '../admin/orders/orders-management-page';
import WindowManagementPage from '../exercise-windows/window-management-page';
import AdminHomePage from '../admin/admin-home-page';
import AwardsPage from '../awards/awards-page/awards-page';
import AwardRouter from "../awards/award-router";
import ContentRouter from "../admin/content/content-router";
import AllModelsImport from "../import/all-models-import";
import ReportsManagementPage from "../reports/reports";
import DividendManagementPage from "../admin/dividend/dividend-management-page";
import FilesRouter from "../files/files-router";

interface Props {
    companyName: string,
    match: match<{}>,
}

class AdminRouter extends Component<Props, {}> {
    render() {
        const { companyName, match } = this.props;

        return (
            <div className="">
                <Switch>
                    <Route path={`${match.path}/client`} render={() => (
                        <TenantManagementPage />
                    )} />
                    <Route path={`${match.path}/content`} render={({ match, location }) => (
                        <ContentRouter match={match} location={location}/>
                    )} />
                    <Route path={`${match.path}/manage`} component={ManagePage} />
                    <Route path={`${match.path}/share-price`} render={() => (
                        <SharePriceManagementPage />
                    )} />
                    <Route path={`${match.path}/entities`} render={() => (
                        <EntityManagementPage />
                    )} />
                    <Route path={`${match.path}/employees`} render={({ match }) => (
                        <EmployeeManagementPage match={match}/>
                    )} />
                    <Route path={`${match.path}/programs`} render={() => (
                        <ProgramManagementPage />
                    )} />
                    <Route path={`${match.path}/awards`} render={() => (
                        <AwardRouter />
                    )} />
                    <Route path={`${match.path}/entity-workflow`} render={() => (
                        <EntityWorkflow
                            tenant={{ name: companyName, tickerId: "AXA" }} />
                    )} />
                    <Route path={`${match.path}/windows`} render={() => (
                        <WindowManagementPage />
                    )} />
                    <Route path={`${match.path}/orders`} render={() => (
                        <OrdersManagementPage />
                    )} />
                    <Route exact path={`${match.path}/reports`} render={() => (
                        <ReportsManagementPage />
                    )} />
                    <Route exact path={`${match.path}/all-awards`} render={() => (
                        <AwardsPage />
                    )} />
                    <Route path={`${match.path}/files`} render={( routeComponentProps ) => (
                        <FilesRouter { ...routeComponentProps } />
                    )} />
                    <Route path={`${match.path}/dividends`} render={({ match }) => (
                        <DividendManagementPage match={match} />
                    )} />
                    <Route exact path={`${match.path}/texts`} render={() => (
                        <TextManagementPage />
                    )} />
                    <Route exact path={`${match.path}/import`} render={() => (
                        <AllModelsImport />
                    )} />
                    <Route path={`${match.path}`} render={() => (
                        <AdminHomePage />
                    )} />
                </Switch>
            </div>
        );
    }
}

export default AdminRouter;
