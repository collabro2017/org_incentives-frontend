import React, { StatelessComponent } from "react";
import { Card } from 'semantic-ui-react'
import { Program } from "../programs/program-reducer";
import moment from "moment";

interface Props {
    program: Program,
}

const ProgramHeader: StatelessComponent<Props> = ({ program }) => (
    <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem', paddingTop:'0.5rem' }}>
                        <span>{program.name}</span>
                        <span>{program.capacity}</span>
                        <span>{`${moment(program.startDate).format("DD.MM.YY")}`} - {`${moment(program.endDate).format( "DD.MM.YY")}`}</span>
                    </div>
                </Card.Header>
            </Card.Content>
        </Card>
    </div>
);

export default ProgramHeader;
