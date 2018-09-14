import React, { StatelessComponent } from "react";
import { Button, Modal, Icon, Header } from "semantic-ui-react";
import { Entity } from "./entity-reducer";

interface Props {
    open: boolean,
    closeModal: () => void,
    deleteEntity: () => void,
    deleteAllEntities: () => void,
    selectedEntity: Entity
}

const DeleteEntitiesModal: StatelessComponent<Props> = ({ open, closeModal, deleteEntity, deleteAllEntities, selectedEntity}) => (
    selectedEntity ?
        <Modal open={open}>
            <i className="close icon" onClick={closeModal}/>
            <Header icon='trash' content={`${selectedEntity.name}`}/>
            <Modal.Content>
                <p>Are you sure you want to delete this entity?</p>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red' onClick={closeModal}>
                    <Icon name='remove' /> No
                </Button>
                <Button color='green' inverted onClick={deleteEntity}>
                    <Icon name='checkmark' /> Yes
                </Button>
            </Modal.Actions>
        </Modal>
        :
        <Modal open={open}>
            <i className="close icon" onClick={closeModal}/>
            <Header icon='trash' content={"Delete Entities"}/>
            <Modal.Content>
                <p>Are you sure you want to delete all entities?</p>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red' onClick={closeModal}>
                    <Icon name='remove' /> No
                </Button>
                <Button color='green' inverted onClick={deleteAllEntities}>
                    <Icon name='checkmark' /> Yes
                </Button>
            </Modal.Actions>
        </Modal>
);

export default DeleteEntitiesModal;
