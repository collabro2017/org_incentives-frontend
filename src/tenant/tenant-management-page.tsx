import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Loader, Dimmer } from 'semantic-ui-react';
import AllTenants from "./all-tenants";
import { connect } from 'react-redux';
import { Tenant } from "./tenant-reducer";
import { FETCH_TENANTS, POST_TENANT, SELECT_TENANT } from "./tenant-actions";
import TenantForm from "./tenant-form";

interface DispatchProps {
    fetchTenants: () => void,
    selectTenant: (tenantId: string) => void,
    postTenant: (tenant: Tenant) => void
}

interface StateProps {
    tenants: Tenant[],
    selectedTenant?: Tenant,
    isFetching: boolean
}

type Props = RouteComponentProps<{}> & DispatchProps & StateProps

class TenantManagementPage extends Component<Props, {}> {

    state = {
        showForm: false
    };

    componentDidMount() {
        this.props.fetchTenants();
    }

    render() {
        const { isFetching, tenants, selectedTenant } = this.props;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        return (
            <div className='width-limit'>
                {
                    this.state.showForm ?
                        <div className={"block-m"}>
                            <h2 className="text-center">New Client</h2>
                            <p className="text-content">Create a new client in our platform</p>
                        </div>
                        :
                        <div className={"flex-row space-between align-center"}>
                            <h2 className={"text-center program-title"}>Clients</h2>
                            <Button primary basic onClick={this.addNewTenant}>
                                <i className="plus icon" />
                                New Client
                            </Button>
                        </div>
                }
                <div>
                    {
                        tenants && tenants.length > 0 && !this.state.showForm ?
                            <div className="width-limit">
                                <AllTenants tenants={tenants} selectTenant={this.props.selectTenant} selectedTenant={selectedTenant}/>
                            </div>
                            :
                            <TenantForm actionButtonOnClick={this.postNewTenant} actionButtonTitle="Create Client" closeForm={this.closeForm}/>
                    }
                </div>
            </div>
        );
    }

    private postNewTenant = (tenant) => {
        this.props.postTenant(tenant);
        this.setState({ showForm: false });
    };

    private closeForm = () => {
        this.setState({ showForm: false });
    };

    private addNewTenant = () => this.setState({ showForm: true });
}

const mapStateToProps = ({ tenant }): StateProps => {
    return ({
        tenants: tenant.allTenants,
        selectedTenant: tenant.selectedTenant,
        isFetching: tenant.isFetching
    });
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchTenants: () => dispatch({ type: FETCH_TENANTS }),
    selectTenant: (tenantId: string) => dispatch({ type: SELECT_TENANT, tenantId }),
    postTenant: (tenant: Tenant) => dispatch({ type: POST_TENANT, tenant })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(TenantManagementPage);

export default withRouter<{}>(ConnectedComponent);
