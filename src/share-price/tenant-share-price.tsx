import React, { StatelessComponent } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { SharePrice } from "./share-price-reducer";
import moment from "moment";
import { Tenant } from "../tenant/tenant-reducer";
import {norwegianLongDate} from "../utils/utils";

interface Props {
    sharePrice: SharePrice[],
    selectedTenant: Tenant,
    openDeleteModal: (sharePrice) => void
}

const TenantSharePrice:StatelessComponent<Props> = ({ sharePrice, selectedTenant, openDeleteModal }) => {

    return (
        <div className='block-s'>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Client</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Price</Table.HeaderCell>
                        <Table.HeaderCell>Manual</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        sharePrice.map((sharePrice) => {
                            return (
                                <Table.Row key={sharePrice.id}>
                                    <Table.Cell>{selectedTenant.name}</Table.Cell>
                                    <Table.Cell>{`${moment(sharePrice.date).format("DD.MM.YY")}`}</Table.Cell>
                                    <Table.Cell>{sharePrice.price.toString().replace('.', ',')}</Table.Cell>
                                    <Table.Cell>{`${sharePrice.manual}`}</Table.Cell>
                                    <Table.Cell>{`${moment(sharePrice.created_at).format(norwegianLongDate)}`}</Table.Cell>
                                    <Table.Cell><Button basic color='red' onClick={openDeleteModal.bind(this, sharePrice)}>Delete Share Price</Button></Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
            </Table>
        </div>
    )
};

export default TenantSharePrice;