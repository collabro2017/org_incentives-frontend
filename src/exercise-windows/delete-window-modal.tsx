import React, { StatelessComponent } from "react";
import { Button, Modal, Icon, Header } from 'semantic-ui-react'

interface Props {
    open: boolean,
    closeModal: () => void
    confirm: () => void
}

const DeleteWindowModal: StatelessComponent<Props> = ({ open, closeModal, confirm }) => (
    <Modal open={open}>
        <i className="close icon" onClick={closeModal}/>
        <Header icon='trash' content='Delete Exercise Window'/>
        <Modal.Content>
            <p>Are you sure you want to delete this window?</p>
        </Modal.Content>
        <Modal.Actions>
            <Button basic color='red' onClick={closeModal}>
                <Icon name='remove' /> No
            </Button>
            <Button color='green' inverted onClick={confirm}>
                <Icon name='checkmark' /> Yes
            </Button>
        </Modal.Actions>
    </Modal>
);

export default DeleteWindowModal;
