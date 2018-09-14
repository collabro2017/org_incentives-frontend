import React, { Component, StatelessComponent } from "react";
import { Modal, Button } from 'semantic-ui-react';
import { CONTACT_EMAIL } from "../index";


export const ErrorModal: StatelessComponent<{ message: string, renderActions: () => React.ReactNode }> = ({ message, renderActions }) => (
    <div className="text-center">
        <Modal open size={"tiny"}>
            <Modal.Header className="text-center error-modal-header">Oops...</Modal.Header>
            <Modal.Content className="text-center">
                <div className="block-m error-modal-description">
                    <Modal.Description>
                        {message}
                    </Modal.Description>
                </div>
                <div className="block-s">
                    {renderActions()}
                </div>
            </Modal.Content>
        </Modal>
    </div>
);

const GeneralErrorModal: StatelessComponent = () => (
    <div className="text-center">
        <Modal open size={"tiny"}>
            <Modal.Header className="text-center error-modal-header">Oops...</Modal.Header>
            <Modal.Content className="text-center">
                <div className="block-m error-modal-description">
                    <Modal.Description>
                        An unknown error occured. Please try again. If the problem persists, please contact us
                        at {CONTACT_EMAIL} or by using the chat in the bottom right corner
                    </Modal.Description>
                </div>
                <div className="block-s">
                    <Button primary basic size={"big"} icon="refresh" content="Try again"
                            onClick={() => window.location.reload()}></Button>
                </div>
            </Modal.Content>
        </Modal>
    </div>
);

export default GeneralErrorModal;
