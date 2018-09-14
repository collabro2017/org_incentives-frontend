import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

interface Props extends FormattedMessage.Props {
    showKeys?: boolean
}

interface State {
}

class Content extends Component<Props, State> {
    render() {
        if (this.props.showKeys) {
            return (
                <span>[{this.props.id}] <FormattedHTMLMessage {...this.props}/></span>
            );
        }

        return <FormattedHTMLMessage {...this.props}/>;
    }
}

export default Content;
