import React, { StatelessComponent } from "react";
import { PurchaseConfig } from "../../subprograms/subprogram-reducer";
import { Table, Button, Card } from 'semantic-ui-react'
import { Link } from "react-router-dom";

interface Props {
    purchaseConfig?: PurchaseConfig,
    editLink: string,
    createLink: string,
    deleteLink?: () => void,
    isDeleting: boolean,
}

const PurchaseConfigPreview: StatelessComponent<Props> = ({ purchaseConfig, editLink, createLink, deleteLink, isDeleting }) => (
        <Card>
            <Card.Content className="text-center" header='Purchase'/>
            {
                purchaseConfig ?
                    <Card.Content>
                        <div>Price: {purchaseConfig.price}</div>
                        <div>Participants: {purchaseConfig.purchase_opportunities.length}</div>
                    </Card.Content> :
                    <Card.Content description="Purchase not created for this subplan"/>
            }
            <Card.Content extra>
                <div className="text-center">
                    {
                        purchaseConfig ?
                            <div>
                                <Link to={editLink}><Button basic>Edit / View</Button></Link>
                                <Button basic onClick={deleteLink} loading={isDeleting}>Delete</Button>
                            </div> :
                            <Link to={createLink}><Button basic>Create purchase opportunity</Button></Link>
                    }
                </div>
            </Card.Content>
        </Card>
);

export default PurchaseConfigPreview;
