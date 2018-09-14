import React, { StatelessComponent } from "react";
import { Table, Button, Card } from 'semantic-ui-react'
import { Link } from "react-router-dom";

interface Props {
    numberOfAwards: number,
    viewDetailsLink: string,
    awardEmployeeOnClick: () => void,
}

const AwardsMetaPreview: StatelessComponent<Props> = ({ numberOfAwards, viewDetailsLink, awardEmployeeOnClick }) => (
        <Card>
            <Card.Content className="text-center" header='Awards' />
            {
                numberOfAwards > 0 ?
                    <Card.Content>
                        <div className="block-xs">Number of awards: {numberOfAwards}</div>
                    </Card.Content> :
                    <Card.Content description="No awards created for this subprogram yet"/>
            }
            <Card.Content extra>
                <div className="text-center">
                    <Button basic onClick={awardEmployeeOnClick}>Award Employee</Button>
                    {
                        numberOfAwards > 0 && <Link to={viewDetailsLink}><Button basic>View All</Button></Link>
                    }
                </div>
            </Card.Content>
        </Card>
);

export default AwardsMetaPreview;
