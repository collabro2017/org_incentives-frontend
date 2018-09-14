import React, { Component, SyntheticEvent } from "react";
import { Header, Icon, Modal, Button } from "semantic-ui-react";

interface Props {
    onModalClose: (event: SyntheticEvent<any>) => void,
    detachEmployee: () => void,
    isSubmitting: boolean,
    fileName: string,
}

class DetachEmployeeModal extends Component<Props> {
    render() {
        const { isSubmitting, onModalClose, fileName, detachEmployee } = this.props;

        return (
            <Modal open closeIcon={<Icon className="close icon" />} onClose={onModalClose}>
                <Header content={`Detach employee from file: ${fileName}`}/>
                <Modal.Content>
                    <p>Are you sure you want to remove the association between this file and the employee?</p>
                    <p>The employee will no longer be able to access the file through the employee portal, and information regarding file acceptance status will be deleted.</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic onClick={onModalClose}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='red' inverted onClick={detachEmployee} loading={isSubmitting}>
                        <Icon name='checkmark' /> Detach
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
};

export default DetachEmployeeModal;
