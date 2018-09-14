import React, { Component } from 'react';
import { Table, Flag, FlagProps, Card, Button } from 'semantic-ui-react';
import {countryOptions } from '../data/common';
import { Entity } from "./entity-reducer";
import { handleSortFunction, SortState } from "../utils/sort";

interface Props {
    entities: Entity[],
    openModalClicked: (entity: Entity) => void,
    openEditFormClicked: (entity: Entity) => void
}

class ViewAllEntities extends Component<Props, SortState> {

    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.entities,
            direction: "ascending"
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {

        const { entities, openModalClicked, openEditFormClicked } = this.props;

        return (
            <div className='block-s'>
                <Card fluid>
                    <Table celled padded sortable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={this.handleSort("name")}>Name</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("identification")}>Identification</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("countryCode")}>Country</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("id")}>Database ID</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("soc_sec")}>SocSec</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                entities.map((entity) => {
                                    const country = countryOptions.filter((option) => option.value === entity.countryCode)[0];
                                    const flagProps: FlagProps = { name: country.flag } as FlagProps;
                                    return (
                                        <Table.Row key={entity.id}>
                                            <Table.Cell>{entity.name}</Table.Cell>
                                            <Table.Cell>{entity.identification}</Table.Cell>
                                            <Table.Cell><Flag {...flagProps}/>{country.text}</Table.Cell>
                                            <Table.Cell>{entity.id}</Table.Cell>
                                            <Table.Cell>{entity.soc_sec}</Table.Cell>
                                            <Table.Cell>
                                                <div className="row-center">
                                                    <Button basic color='green' onClick={openEditFormClicked.bind(this, entity)}>Edit Entity</Button>
                                                    <Button basic color='red' onClick={openModalClicked.bind(this, entity)}>Delete Entity</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        )
    }
}

export default ViewAllEntities;



