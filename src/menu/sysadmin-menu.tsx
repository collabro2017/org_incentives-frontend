import React, { Component } from 'react';
import { Menu, Dropdown, Button } from "semantic-ui-react";
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

interface StateProps {
    selectedTenant?: {
        name: string,
        id: string,
    }
}
const clientRoute = '/admin/client';
export const contentRoute = '/admin/content';

class SiteMenu extends Component<StateProps, {}> {
    render() {
        return (
            <nav className="site-header">
                <Menu size='small' className={"force-no-border-radius"} inverted>
                    <Menu.Menu position='right'>
                        <Menu.Item onClick={() => {}}>
                            Selected client: {this.selectedClient()}
                        </Menu.Item>
                        <Menu.Item active={location.pathname && location.pathname.startsWith(contentRoute)} as={Link} to={contentRoute}>
                            Manage Content
                        </Menu.Item>
                        <Menu.Item active={location.pathname && location.pathname.startsWith(clientRoute)} as={Link} to={clientRoute}>
                            Manage Clients
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </nav>
        );
    }

    private selectedClient = () => this.props.selectedTenant ? this.props.selectedTenant.name : 'No client selected';
}

const mapStateToProps = ({ tenant }): StateProps => ({
    selectedTenant: tenant.selectedTenant
});

export default connect<StateProps>(mapStateToProps)(SiteMenu);
