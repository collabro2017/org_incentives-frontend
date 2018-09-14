import React, { Component, StatelessComponent } from "react";
import { Modal, Button } from 'semantic-ui-react';
import { CONTACT_EMAIL } from "../index";

const LoginErrorModal: StatelessComponent = () => (
    <div className="text-center">
        <Modal open size={"tiny"}>
            <Modal.Header className="text-center error-modal-header">Login error</Modal.Header>
            <Modal.Content className="text-center">
                <div className="block-m error-modal-description">
                    <div className="block-m">
                        <Modal.Description>
                            An error occured while trying to login. The login link expires in 5 minutes and can only be used once, so if you used an old email or you've logged in with the email link before, you'll have to request a new login link from the login page.
                        </Modal.Description>
                    </div>
                    <div className="block-m">
                        <Modal.Description>
                            If the problem persists, please contact us at {CONTACT_EMAIL} or by using the chat in the bottom right corner.
                        </Modal.Description>
                    </div>
                </div>
                <div className="block-s">
                    <Button primary basic content="Go to login page" onClick={() => window.location.href = '/login'}></Button>
                </div>
            </Modal.Content>
        </Modal>
    </div>
);

export default LoginErrorModal;
