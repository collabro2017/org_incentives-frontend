import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Loader, Dimmer } from 'semantic-ui-react';
import { Tenant } from "../tenant/tenant-reducer";
import AdminTenantPreview from './admin-tenant-preview';
import { DELETE_TENANT, FETCH_TENANTS, PUT_TENANT } from "../tenant/tenant-actions";
import { Redirect } from "react-router";
import TenantForm from "../tenant/tenant-form";


interface DispatchProps {
    fetchTenants: () => void,
    putTenant: (selectedTenant: Tenant, tenantId: string) => void,
    deleteTenant: (tenantId: string) => void
}

interface StateProps {
    tenants: Tenant[],
    selectedTenant?: Tenant,
    isFetching: boolean
}

type Props = DispatchProps & StateProps

class AdminHomePage extends Component<Props, {}> {

    state = {
        showForm: false
    };

    componentDidMount() {
        this.props.fetchTenants();
    }

    render() {
        const { isFetching, selectedTenant } = this.props;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        if(!selectedTenant) {
            return <Redirect to={'/admin/client'}/>
        }

        return (
            <div className="width-limit-small">
                {
                    selectedTenant && !this.state.showForm ?
                        <AdminTenantPreview selectedTenant={selectedTenant} deleteTenant={this.deleteSelectedTenant} openEditForm={this.openEditForm}/>
                        :
                        <TenantForm actionButtonOnClick={this.editSelectedTenant} actionButtonTitle="Update Client" closeForm={this.closeEditForm} defaultValues={this.props.selectedTenant}/>
                }
            </div>
        )
    }

    private openEditForm = () => {
        this.setState({ showForm: true });
    };

    private closeEditForm = () => {
        this.setState({ showForm: false });
    };

    private editSelectedTenant = (tenant: Tenant) => {
        this.props.putTenant(tenant, this.props.selectedTenant.id);
        this.setState({ openModal: false, showForm: false });
    };

    private deleteSelectedTenant = () => {
        this.props.deleteTenant(this.props.selectedTenant.id);
    }
}

const mapStateToProps = (state): StateProps => {
    return ({
        tenants: state.tenant.allTenants,
        selectedTenant: state.tenant.selectedTenant,
        isFetching: state.tenant.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchTenants: () => dispatch ({ type: FETCH_TENANTS }),
    putTenant: (selectedTenant: Tenant, tenantId: string) => dispatch ({ type: PUT_TENANT, selectedTenant, tenantId }),
    deleteTenant: (tenantId: string) => dispatch({ type: DELETE_TENANT, tenantId })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(AdminHomePage);

export default ConnectedComponent;
