import React, { StatelessComponent } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import { Tenant } from "./tenant-reducer";

interface Props {
    tenants: Tenant[],
    selectTenant: (tenantId: string) => void
    selectedTenant?: Tenant
}

const AllTenants:StatelessComponent<Props> = ({ tenants, selectTenant, selectedTenant }) => {
    return (
        <div className='block-m'>
            <Card.Group>
                {
                    tenants.map((tenant) => {
                        return (
                            <Card key={tenant.id} fluid>
                                <Card.Content>
                                    <Image floated='right' size='mini' src={tenant.logo_url}/>
                                    <Card.Header>
                                        {tenant.name}
                                    </Card.Header>
                                    <Card.Meta>
                                        <div>{`Exercise: ${tenant.feature && !!tenant.feature.exercise}`}</div>
                                        <div>{`Documents: ${tenant.feature && !!tenant.feature.documents}`}</div>
                                        <div>{`Purchase: ${tenant.feature && !!tenant.feature.purchase}`}</div>
                                        <div>{`Logo url: ${tenant.logo_url ? tenant.logo_url : 'No logo url registered'}`}</div>
                                        <div>Currency: {tenant.currency_code}</div>
                                        <div>{`Account for payments: ${tenant.bank_account_number ? tenant.bank_account_number : 'No account number registered'}`}</div>
                                    </Card.Meta>
                                </Card.Content>
                                <Card.Content extra>
                                    <div className="text-center">
                                        {
                                            selectedTenant && selectedTenant.id === tenant.id ?
                                                <span>Selected</span>
                                                :
                                                <div className="text-center ui two buttons">
                                                    <Button basic color='grey' type='submit' onClick={selectTenant.bind(this, tenant.id)}>Select</Button>
                                                </div>
                                        }
                                    </div>
                                </Card.Content>
                            </Card>
                        )
                    })
                }
            </Card.Group>
        </div>
    )
};


export default AllTenants;