import React, { StatelessComponent } from "react";
import { Card, Table, Button } from "semantic-ui-react";
import { Text, TextObject } from "./text-reducer";

interface Props {
    texts: TextObject,
    deleteText: (key: string) => void,
    openEditModal: (key: string, value: string) => void
}

const AllTexts: StatelessComponent<Props> = ({ texts, deleteText, openEditModal }) => {

    return (
        <div className='block-s'>
            <Card fluid>
                <Table celled padded>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Key</Table.HeaderCell>
                            <Table.HeaderCell>Value</Table.HeaderCell>
                            <Table.HeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            Object.keys(texts || {}).map((key) => {
                                const text = texts[key];
                                return (
                                    <Table.Row key={key}>
                                        <Table.Cell>{`${key}`}</Table.Cell>
                                        <Table.Cell>{`${text.value}`}</Table.Cell>
                                        <Table.Cell singleLine>
                                            <Button basic onClick={openEditModal.bind(this, key, text.value)}>{text.overridden ? 'Edit Text' : 'Override text'}</Button>
                                            {
                                                text.overridden && <Button basic onClick={deleteText.bind(this, key)}>Reset to default</Button>
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>
                </Table>
            </Card>
        </div>
    )
};

export default AllTexts;
