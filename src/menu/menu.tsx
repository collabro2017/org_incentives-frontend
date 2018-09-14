import React, { Component } from 'react';
import { Menu, Dropdown, Button, Icon, Popup } from "semantic-ui-react";
import { Redirect, Route, Link, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { connect } from 'react-redux';
import { Features } from "../features/features-reducer";
import './menu.less';
import { SharePrice } from "../exercise/exercise-router";
import numeral from "numeral";
import { formatCurrency, formatSharePrice } from "../utils/utils";
import { Tenant } from "../tenant/tenant-reducer";
import {AUTH0_CLIENT_ID, AUTH0_LOGOUT_URL} from "../env";

const employeePortalHomeRoute = '/';
const tenantRoute = '/client';
const reportsRoute = '/admin/reports';
const helpRoute = '/help';
export const documentsRoute = '/documents';
const importRoute = '/admin/import';
export const adminFilesRoute = '/admin/files';
export const logoutRoute = '/logout';
const entitiesRoute = '/admin/entities';
const employeeRoute = '/employees';
const programsRoute = '/admin/programs';
const sharePriceRoute = '/admin/share-price';
const tenantAwardsRoute = '/admin/all-awards';
export const awardsRoute = '/admin/awards';
export const subprogramAwardsRoute = (subprogramId: string) => `${awardsRoute}/subprogramawards/${subprogramId}`;
export const employeesRoute = '/admin/employees';
export const dividendsRoute = '/admin/dividends';
const manageRoute = '/admin/manage';
const workflowRoute = '/admin/entity-workflow/entity';
const adminWindowsRoute = '/admin/windows';
const adminOrdersRoute = '/admin/orders';
const textsRoute = '/admin/texts';
export const exerciseRoute = '/exercise';
export const purchaseRoute = '/purchase';
export const orderRoute = '/orders';
const instrumentsRoute = '/instruments';
const adminHomeRoute = '/admin';
const employeePortalRoute = '/';

interface Props {
    userName: string,
}

interface StateProps {
    showAdminMenu: boolean,
    isAdmin: boolean,
    features: Features,
    logoUrl?: string,
    sharePrice: SharePrice,
    selectedTenant?: Tenant,
}

class SiteMenu extends Component<RouteComponentProps<{}> & Props & StateProps, {}> {
    state = { activeItem: employeePortalHomeRoute };

    render() {
        const { match, location, history } = this.props;
        return (
            <nav className="site-header">
                <div>
                    {
                        location.pathname.startsWith(adminHomeRoute) && this.renderAdminToolMenu()
                    }
                </div>
                <div className="menu-employee-portal">
                    {
                        !location.pathname.startsWith(adminHomeRoute) && this.renderEmployeePortalMenu()
                    }
                </div>
                <div className="menu-employee-portal-mobile">
                    {
                        !location.pathname.startsWith(adminHomeRoute) && this.renderEmployeePortalMobileMenu()
                    }
                </div>
            </nav>

        );
    }

    renderAdminToolMenu() {
        const { location, selectedTenant } = this.props;
        return (
            <Menu size='tiny' className={"force-no-border-radius"}>
                {
                    selectedTenant &&
                    <div className="flex-row align-center space-between flex-1 left-menu-container">
                        { selectedTenant.logo_url && <Link to={adminHomeRoute}><img src={selectedTenant.logo_url} alt="" className="logo"/></Link> }
                    </div>
                }
                {
                    /*
                    <Menu.Item active={location.pathname && location.pathname.startsWith(manageRoute)} as={Link}
                           to={manageRoute}>
                        Manage
                    </Menu.Item>*/
                }
                <Menu.Menu position='right'>
                    {/*<Menu.Item active={location.pathname && location.pathname.startsWith(employeePortalHomeRoute)}*/}
                               {/*as={Link} to={employeePortalRoute}>*/}
                        {/*To Employee Portal*/}
                    {/*</Menu.Item>*/}
                    <Menu.Item active={location.pathname === employeePortalHomeRoute} as={Link} to={adminHomeRoute}>
                        Home
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(reportsRoute)} as={Link} to={reportsRoute}>
                        Reports
                    </Menu.Item>
                    {
                       /*
                    <Menu.Item active={location.pathname && location.pathname.startsWith(workflowRoute)} as={Link}
                               to={workflowRoute}>
                        Workflow
                    </Menu.Item>
                        */
                    }
                    <Menu.Item active={location.pathname && location.pathname.startsWith(entitiesRoute)} as={Link}
                               to={entitiesRoute}>
                        Entities
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(employeesRoute)} as={Link}
                               to={employeesRoute}>
                        Employees
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(programsRoute)} as={Link}
                               to={programsRoute}>
                        Programs
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(awardsRoute)} as={Link}
                               to={awardsRoute}>
                        Awards
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(adminWindowsRoute)} as={Link}
                               to={adminWindowsRoute}>
                        Windows
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(sharePriceRoute)} as={Link}
                               to={sharePriceRoute}>
                        Share Price
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(tenantAwardsRoute)} as={Link}
                               to={tenantAwardsRoute}>
                        All Awards
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(adminOrdersRoute)} as={Link}
                               to={adminOrdersRoute}>
                        Orders
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(textsRoute)} as={Link}
                               to={textsRoute}>
                        Texts
                    </Menu.Item>

                    <Menu.Item active={location.pathname && location.pathname.startsWith(importRoute)} as={Link}
                               to={importRoute}>
                        Import
                    </Menu.Item>

                    <Menu.Item active={location.pathname && location.pathname.startsWith(adminFilesRoute)} as={Link}
                               to={adminFilesRoute}>
                        Files
                    </Menu.Item>
                    <Menu.Item active={location.pathname && location.pathname.startsWith(dividendsRoute)} as={Link}
                               to={dividendsRoute}>
                        Dividends
                    </Menu.Item>
                    <Dropdown item text={`${this.props.userName}`}>
                        <Dropdown.Menu>
                            <Dropdown.Item>Settings</Dropdown.Item>
                            <Dropdown.Item as={'a'} href={AUTH0_LOGOUT_URL}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
        );
    }

    renderEmployeePortalMenu() {
        const { location, features, sharePrice, userName, logoUrl, showAdminMenu } = this.props;
        return (
            <Menu size='massive' className={"force-no-border-radius"}>
                <div className="flex-row align-center space-between flex-1 left-menu-container">
                    { logoUrl && <Link to={employeePortalHomeRoute}><img src={logoUrl} alt="" className="logo"/></Link> }
                    { sharePrice && <span className="menu-share-price">Last available closing price: {formatSharePrice(sharePrice.sharePrice)} <Popup
                        trigger={<Icon name='question circle outline' />}
                        header='Share price'
                        content={`End of day price, ${sharePrice.sharePriceDate.format("DD.MM.YYYY")}`}
                    /></span>}
                </div>


                <Menu.Menu position='right'>
                    <Menu.Item active={location.pathname === employeePortalHomeRoute} as={Link}
                               to={employeePortalHomeRoute}>
                        Overview
                    </Menu.Item>
                    {/*{*/}
                        {/*features.exercise &&*/}
                        {/*<Menu.Item active={location.pathname && location.pathname.startsWith(exerciseRoute)} as={Link}*/}
                                   {/*to={exerciseRoute}>*/}
                            {/*Exercise*/}
                        {/*</Menu.Item>*/}
                    {/*}*/}
                    {/*{*/}
                        {/*features.exercise &&*/}
                        {/*<Menu.Item active={location.pathname && location.pathname.startsWith(orderRoute)} as={Link}*/}
                                   {/*to={orderRoute}>*/}
                            {/*Orders*/}
                        {/*</Menu.Item>*/}
                    {/*}*/}
                    {/*<Menu.Item active={location.pathname && location.pathname.startsWith(instrumentsRoute)} as={Link}*/}
                               {/*to={instrumentsRoute}>*/}
                        {/*Instruments*/}
                    {/*</Menu.Item>*/}
                    <Menu.Item active={location.pathname && location.pathname.startsWith(helpRoute)} as={Link}
                               to={helpRoute}>
                        Support
                    </Menu.Item>
                    {
                        features.documents &&
                        <Menu.Item active={location.pathname && location.pathname.startsWith(documentsRoute)} as={Link}
                                   to={documentsRoute}>
                            Documents
                        </Menu.Item>
                    }
                    {
                        showAdminMenu &&
                        <Menu.Item active={location.pathname && location.pathname.startsWith(adminHomeRoute)} as={Link}
                                   to={adminHomeRoute}>
                            To Administration
                        </Menu.Item>
                    }
                    <Dropdown item text={`${userName}`}>
                        <Dropdown.Menu>
                            {/*<Dropdown.Item>Settings</Dropdown.Item>*/}
                            <Dropdown.Item as={'a'} href={AUTH0_LOGOUT_URL}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
        );
    }

    renderEmployeePortalMobileMenu() {
        const { location, features, sharePrice, showAdminMenu, logoUrl } = this.props;
        return (
            <Menu size='huge' className={"force-no-border-radius"}>
                <div className="flex-row align-center space-between flex-1 left-menu-container">
                    { logoUrl && <Link to={employeePortalHomeRoute}><img src={logoUrl} alt="" className="logo"/></Link> }
                    { sharePrice && <span className="menu-share-price">Last available closing price: {formatSharePrice(sharePrice.sharePrice)} <Popup
                        trigger={<Icon name='question circle outline' />}
                        header='Share price'
                        content={`End of day price, ${sharePrice.sharePriceDate.format("DD.MM.YYYY")}`}
                    /></span>}
                </div>
                <Menu.Menu position='right'>
                    <Dropdown item text={`Menu`}>
                        <Dropdown.Menu>
                            {/*<Dropdown.Item>Settings</Dropdown.Item>*/}
                            <Dropdown.Item
                                active={location.pathname === employeePortalHomeRoute}
                                as={Link} to={employeePortalHomeRoute}>Overview</Dropdown.Item>
                            {/*{*/}
                                {/*features.exercise &&*/}
                                {/*<Dropdown.Item active={location.pathname && location.pathname.startsWith(exerciseRoute)}*/}
                                               {/*as={Link} to={exerciseRoute}>Exercise</Dropdown.Item>*/}
                            {/*}*/}
                            {/*{*/}
                                {/*features.exercise &&*/}
                                {/*<Dropdown.Item active={location.pathname && location.pathname.startsWith(orderRoute)}*/}
                                               {/*as={Link} to={orderRoute}>Orders</Dropdown.Item>*/}
                            {/*}*/}
                            {/*<Dropdown.Item active={location.pathname && location.pathname.startsWith(instrumentsRoute)}*/}
                                           {/*as={Link} to={instrumentsRoute}>Instruments</Dropdown.Item>*/}
                            <Dropdown.Item active={location.pathname && location.pathname.startsWith(helpRoute)}
                                           as={Link} to={helpRoute}>Support</Dropdown.Item>

                            {
                                features.documents &&
                                <Dropdown.Item active={location.pathname && location.pathname.startsWith(documentsRoute)}
                                               as={Link} to={documentsRoute}>
                                    Documents
                                </Dropdown.Item>
                            }

                            {
                                showAdminMenu &&
                                <Dropdown.Item
                                    active={location.pathname && location.pathname.startsWith(adminHomeRoute)} as={Link}
                                    to={adminHomeRoute}>To Administration</Dropdown.Item>
                            }
                            <Dropdown.Item as={'a'} href={AUTH0_LOGOUT_URL}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
        );
    }
}

const mapStateToProps = ({ user, features, instrument, tenant }) => ({
    showAdminMenu: user.isSysadmin || user.isAdmin,
    isAdmin: user.isAdmin,
    sharePrice: instrument.sharePrice,
    logoUrl: user.tenant && user.tenant.logo_url,
    selectedTenant: tenant.selectedTenant,
    features
});

export default withRouter<Props>(connect<StateProps>(mapStateToProps)(SiteMenu));
