import React, { Component, SyntheticEvent } from "react";
import { Header, Icon, Modal, Button, Message } from "semantic-ui-react";
import { Employee } from "../../employees/employee-reducer";
import { employeeName } from "../../utils/utils";

interface Props {
    onModalClose: (event: SyntheticEvent<any>) => void,
    isSubmitting: boolean,
    fileName: string,
    confirmDelete: () => void,
    affectedEmployees: Employee[],
}

class DeleteDocumentModal extends Component<Props> {
    render() {
        const { isSubmitting, onModalClose, fileName, confirmDelete } = this.props;

        return (
            <Modal open closeIcon={<Icon className="close icon" />} onClose={onModalClose}>
                <Header content={`Delete file: ${fileName}`}/>
                <Modal.Content>
                    <p className="block-m">Are you sure you want to permanently delete the file {fileName}?</p>
                    {
                        this.props.affectedEmployees.length > 0 &&
                        <Message color={"red"}>
                            <Message.Header>The following users will not see the document in the employee portal anymore</Message.Header>
                            <Message.Content>
                                <ul>
                                {
                                    this.props.affectedEmployees.map((e) => (
                                        <li key={e.id}>{employeeName(e)}</li>
                                    ))
                                }
                                </ul>
                            </Message.Content>
                        </Message>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button basic onClick={onModalClose}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='red' inverted onClick={confirmDelete} loading={isSubmitting}>
                        <Icon name='checkmark' /> Delete
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
};

export default DeleteDocumentModal;
