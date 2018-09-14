import React, { StatelessComponent } from "react";
import { Button, Modal, Icon, Header } from "semantic-ui-react";
import { Employee } from "./employee-reducer";

interface Props {
    open: boolean,
    selectedEmployee: Employee
    closeModal: () => void,
    deleteEmployee: () => void
    deleteAllEmployees: () => void
}

const DeleteEmployeesModal: StatelessComponent<Props> = ({ open, closeModal, selectedEmployee, deleteEmployee, deleteAllEmployees }) => (
    selectedEmployee ?
        <Modal open={open}>
            <i className="close icon" onClick={closeModal}/>
            <Header icon='trash' content={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}/>
            <Modal.Content>
                <p>Are you sure you want to delete this employee?</p>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red' onClick={closeModal}>
                    <Icon name='remove' /> No
                </Button>
                <Button color='green' inverted onClick={deleteEmployee}>
                    <Icon name='checkmark' /> Yes
                </Button>
            </Modal.Actions>
        </Modal>
        :
        <Modal open={open}>
            <i className="close icon" onClick={closeModal}/>
            <Header icon='trash' content={'Delete Employees'}/>
            <Modal.Content>
                <p>Are you sure you want to delete this employee?</p>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red' onClick={closeModal}>
                    <Icon name='remove' /> No
                </Button>
                <Button color='green' inverted onClick={deleteAllEmployees}>
                    <Icon name='checkmark' /> Yes
                </Button>
            </Modal.Actions>
        </Modal>
);

export default DeleteEmployeesModal