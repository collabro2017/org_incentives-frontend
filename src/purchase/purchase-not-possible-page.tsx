import React, { StatelessComponent } from 'react';
import { Message } from 'semantic-ui-react';
import Content from "../texts/content";

export enum PurchaseNotPossibleReason {
    NO_PURCHASABLE_INSTRUMENTS = 'NO_PURCHASABLE_INSTRUMENTS',
    NOT_IN_A_PURCHASE_WINDOW = 'NOT_IN_A_PURCHASE_WINDOW'
}

const MessageNoPurchasableInstruments: StatelessComponent<{}> = () => (
    <Message>
        <Message.Header><Content id="purchase.not.possible.nopurchasableinstruments.header"/></Message.Header>
        <Message.Content><Content id="purchase.not.possible.nopurchasableinstruments.description"/></Message.Content>
    </Message>
);

const MessageNotInAPurchaseWindow: StatelessComponent<{}> = () => (
    <Message>
        <Message.Header><Content id="purchase.not.possible.notinwindow.header"/></Message.Header>
        <Message.Content><Content id="purchase.not.possible.notinwindow.description"/></Message.Content>
    </Message>
);


const PurchaseNotPossiblePage: StatelessComponent<{ reason: PurchaseNotPossibleReason }> = ({ reason }) => (
    <div className="main-content">
        <div className="text-content-center">
            {
               reason === PurchaseNotPossibleReason.NO_PURCHASABLE_INSTRUMENTS && <MessageNoPurchasableInstruments />
            }
            {
                reason === PurchaseNotPossibleReason.NOT_IN_A_PURCHASE_WINDOW && <MessageNotInAPurchaseWindow />
            }
        </div>
    </div>
);

export default PurchaseNotPossiblePage;
