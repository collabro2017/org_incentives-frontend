import React, { Component } from 'react';
import { Card, Image, Modal, Button, Header, Icon } from 'semantic-ui-react';
import { Tenant } from "../tenant/tenant-reducer";
import { Link } from "react-router-dom";

interface Props {
    selectedTenant: Tenant,
    deleteTenant: (tenantId: string) => void,
    openEditForm: () => void
}

interface State {
    openModal: boolean
}

class AdminTenantPreview extends Component<Props, State> {

    state = {
        openModal: false
    };


    render() {
        const { selectedTenant } = this.props;

        return (
            <div>
                <Card key={selectedTenant.id} fluid>
                    <Card.Content>
                        <Image floated='right' size='mini' src={selectedTenant.logo_url}/>
                        <Card.Header className="block-m">
                            {selectedTenant.name}
                        </Card.Header>
                        <Card.Meta>
                            <div className="block-s"><strong>Exercise: &nbsp;</strong>{`${selectedTenant.feature && !!selectedTenant.feature.exercise}`}</div>
                            <div className="block-s"><strong>Documents: &nbsp;</strong>{`${selectedTenant.feature && !!selectedTenant.feature.documents}`}</div>
                            <div className="block-s"><strong>Purchase: &nbsp;</strong>{`${selectedTenant.feature && !!selectedTenant.feature.purchase}`}</div>
                            <div className="block-s"><strong>Logo url: &nbsp;</strong>{`${selectedTenant.logo_url ? selectedTenant.logo_url : 'No logo url registered'}`}</div>
                            <div className="block-s"><strong>Currency: &nbsp;</strong>{selectedTenant.currency_code}</div>
                            <div className="block-s"><strong>Account for payments: &nbsp;</strong>{`${selectedTenant.bank_account_number ? selectedTenant.bank_account_number : 'No account number registered'}`}</div>
                            <div className="block-s"><strong>BIC (foreign payments): &nbsp;</strong>{`${selectedTenant.bic_number ? selectedTenant.bic_number: 'No BIC number registered'}`}</div>
                            <div className="block-s"><strong>IBAN (foreign payments): &nbsp;</strong>{`${selectedTenant.iban_number ? selectedTenant.iban_number : 'No IBAN number registered'}`}</div>
                            <div className="block-s">
                                <div><strong>Payment Address:</strong></div>
                                <textarea cols={30} rows={5} disabled value={selectedTenant.payment_address || ''}/>
                            </div>
                            <div className="block-s">
                                <div><strong>Comment:</strong></div>
                                <textarea cols={30} rows={5} disabled value={selectedTenant.comment || ''}/>
                            </div>
                        </Card.Meta>
                    </Card.Content>
                    <Card.Content extra>
                        <div className="text-center ui two buttons">
                            <Button basic color='green' onClick={this.props.openEditForm}>Edit</Button>
                            <Button basic color='red' onClick={this.openDeleteModal}>Delete</Button>
                        </div>
                    </Card.Content>
                </Card>
                <div>
                    <Modal open={this.state.openModal}>
                        <i className="close icon" onClick={() => this.setState({ openModal: false })}/>
                        <Header icon='trash' content='Delete Selected Tenant'/>
                        <Modal.Content>
                            <p>You selected {selectedTenant.name}. Are you sure you want to delete this client?</p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button basic color='red' onClick={() => this.setState({ openModal: false })}>
                                <Icon name='remove' /> No
                            </Button>
                            <Link to={'/admin/client'}><Button color='green' inverted onClick={this.deleteSelectedTenant}>
                                <Icon name='checkmark' /> Yes
                            </Button></Link>
                        </Modal.Actions>
                    </Modal>
                </div>
            </div>
        )
    }

    private openDeleteModal = () => {
        this.setState({ openModal: true });
    };

    private deleteSelectedTenant = () => {
        this.props.deleteTenant(this.props.selectedTenant.id);
    }

}

export default AdminTenantPreview;