import React, { Component, StatelessComponent } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { Window, WindowType } from "./window-reducer";
import moment, { isMoment } from "moment";
import { handleSortFunction, SortState } from "../utils/sort";

interface Props {
    windows: Window[],
    openDeleteModal: (exerciseWindow: Window) => void,
    openEditForm: ( exerciseWindow: Window) => void
}

const classForWindowType = (type: WindowType): string => {
    switch (type) {
        case WindowType.EXERCISE: return 'tag-blue';
        case WindowType.PURCHASE: return 'tag-teal';
        default: return '';
    }
};

class ViewWindows extends Component<Props, SortState> {
    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.windows,
            direction: 'ascending',
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {
        const { windows, openDeleteModal, openEditForm } = this.props;
        return (
            <div className="block-s">
                <Table celled padded sortable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell onClick={this.handleSort('window_type')}>Type</Table.HeaderCell>
                            <Table.HeaderCell onClick={this.handleSort('start_time')}>Start Date</Table.HeaderCell>
                            <Table.HeaderCell onClick={this.handleSort('end_time')}>End Date</Table.HeaderCell>
                            <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Payment Deadline</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            windows.map((window) => {
                                return (
                                    <Table.Row key={window.id}>
                                        <Table.Cell><span className={`tag ${classForWindowType(window.window_type)}`}>{window.window_type}</span></Table.Cell>
                                        <Table.Cell>{`${moment(window.start_time).format("lll")}`}</Table.Cell>
                                        <Table.Cell>{`${moment(window.end_time).format("lll")}`}</Table.Cell>
                                        <Table.Cell>{window.payment_deadline && `${moment(window.payment_deadline).format("lll")}`}</Table.Cell>
                                        <Table.Cell>
                                            <div className="row-center">
                                                <Button basic color='green' onClick={openEditForm.bind(this, window)}>Edit Window</Button>
                                                <Button basic color='red' onClick={openDeleteModal.bind(this, window)}>Delete Window</Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        )
    }
};

export default ViewWindows;