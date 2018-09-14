import React, { StatelessComponent } from 'react';
import { Table, Flag, FlagProps } from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import { Entity } from "./entity-reducer";

interface Props {
    entities: Entity[]
}

const EntitiesPreview: StatelessComponent<Props> = ({ entities }) => {

    return (
        <div className='block-m'>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Identification</Table.HeaderCell>
                        <Table.HeaderCell>Country</Table.HeaderCell>
                        <Table.HeaderCell>SocSec</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        entities.map((entity) => {
                            const country = countryOptions.filter((option) => option.text === entity.countryCode)[0];
                            const flagProps: FlagProps = { name: country.flag } as FlagProps;

                            return (
                                <Table.Row key={`${entity.name}-${entity.identification}`}>
                                    <Table.Cell>{entity.name}</Table.Cell>
                                    <Table.Cell>{entity.identification}</Table.Cell>
                                    <Table.Cell><Flag {...flagProps}/>{country.text}</Table.Cell>
                                    <Table.Cell>{entity.soc_sec}</Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                </Table.Body>
            </Table>
        </div>
    )
};


export default EntitiesPreview;
