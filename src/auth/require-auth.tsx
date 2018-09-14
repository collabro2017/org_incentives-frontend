import React, { Component, StatelessComponent } from 'react';
import { Redirect, RouteComponentProps } from "react-router";
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import { KEEP_ALIVE_ACTION } from "./keep-alive-saga";
import { logoutRoute } from "../menu/menu";

interface Props {
    children?: any;
}

interface StateProps {
    isLoggedIn: boolean,
}

interface DispatchProps {
    keepAlive: () => void
}

interface State {
    cancelListener: () => void,
}

const loginUrl = '/login';

class RequireAuth extends Component<RouteComponentProps<{}> & Props & StateProps & DispatchProps, State> {
    state = {
        cancelListener: () => {}
    };

    componentDidMount() {
        const cancelListener = this.props.history.listen((location, action) => {
            if (location.pathname !== logoutRoute) {
                this.props.keepAlive();
            }
        });
        this.setState({ cancelListener });
    }

    render() {
        return this.props.isLoggedIn ? this.props.children : <Redirect to={loginUrl}/>;
    }

    componentWillUnmount() {
        this.state.cancelListener();
    }
}
const mapStateToProps = ({ user }) => ({
    isLoggedIn: user.loggedIn,
});

const mapDispatchToProps = (dispatch) => ({
    keepAlive: () => dispatch({ type: KEEP_ALIVE_ACTION }),
});

export default withRouter<Props>(connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(RequireAuth));