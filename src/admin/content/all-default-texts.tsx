import React, { StatelessComponent } from "react";
import { Card, Table, Button } from "semantic-ui-react";
import { Text } from "../../texts/text-reducer";

interface Props {
    texts: Text,
    openEditModal: (key: string, value: string) => void
}

const AllDefaultTexts: StatelessComponent<Props> = ({ texts, openEditModal }) => {
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
                                return (
                                    <Table.Row key={key}>
                                        <Table.Cell>{`${key}`}</Table.Cell>
                                        <Table.Cell>{`${texts[key]}`}</Table.Cell>
                                        <Table.Cell singleLine>
                                            <Button basic onClick={openEditModal.bind(this, key, texts[key])}>Edit Text</Button>
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

export default AllDefaultTexts;
