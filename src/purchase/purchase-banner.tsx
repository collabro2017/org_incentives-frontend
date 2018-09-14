import React, { Component } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { PurchaseWindow, Window } from "../data/data";
import { Button, Icon } from 'semantic-ui-react';
import { purchaseRoute } from "../menu/menu";
import { Link } from 'react-router-dom';
import { RootState } from "../reducers/all-reducers";
import '../less/banner.less';

interface StateProps {
    currentWindow: PurchaseWindow,
    nextWindow: Window,
    hasFeature: boolean,
}

class PurchaseBanner extends Component<StateProps, null> {
    render() {
        const { currentWindow, nextWindow, hasFeature } = this.props;

        if (!hasFeature) {
            return null;
        }

        if (this.notInWindow() || this.noInstrumentsToPurchase()) {
            if (nextWindow) {
               return (
                   <div className="banner">
                       <Icon name="info circle" inverted className="banner-icon" size="big"/>
                       <span>Next purchase window will be from {nextWindow.from.format('lll')} to {nextWindow.to.format('lll')}.</span>
                   </div>
               );
            }

            return null;
        }

        return (
            <div className="banner">
                <Icon name="info circle" inverted className="banner-icon" size="big"/>
                <span>Current purchase window closes on {currentWindow.to.format('lll')}.</span>
                <Button className="banner-button" inverted basic content="Start Purchasing" as={Link} to={purchaseRoute} />
            </div>
        );
    }

    private notInWindow = () => !this.props.currentWindow;
    private noInstrumentsToPurchase = () =>
        (this.props.currentWindow && !this.props.currentWindow.purchase_opportunity)
        ||
        (this.props.currentWindow && this.props.currentWindow.purchase_opportunity.purchasedAmount >= this.props.currentWindow.purchase_opportunity.maximumAmount);
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ user, features }): StateProps => ({
    currentWindow: user.currentPurchaseWindow,
    nextWindow: user.nextPurchaseWindow,
    hasFeature: features.purchase,
});

export default connect(mapStateToProps)(PurchaseBanner);
