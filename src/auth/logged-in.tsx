import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps } from "react-router";
import LoginErrorModal from "./login-error";

interface DispatchProps {
    parseAuthHash: () => void,
}

interface StateProps {
    loggedIn: boolean,
    loginError: boolean,
    showAdminMenu: boolean,
}


class LoggedInCallback extends Component<RouteComponentProps<{}> & DispatchProps & StateProps, {}> {
    render() {
        if (this.props.loggedIn) {
            return <Redirect to={this.props.showAdminMenu ? '/admin/client' : '/' }/>
        }

        if (/access_token|id_token|error/.test(this.props.location.hash)) {
            this.props.parseAuthHash();
        }

        if (this.props.loginError) {
            return (
                <div className="block-m">
                    <LoginErrorModal/>
                </div>
            );
        }

        return (
            <div className="block-m">
                <h2 className="text-center">Logging in...</h2>
            </div>
        );
    }
}

const mapStateToProps = ({ user }) => ({
    loggedIn: user.loggedIn,
    loginError: user.loginError,
    showAdminMenu: user.isSysadmin || user.isAdmin,
});
const mapDispatchToProps = (dispatch) => ({
    parseAuthHash: () => dispatch({ type: "PARSE_AUTH_HASH" }),
});
export default connect(mapStateToProps, (mapDispatchToProps))(LoggedInCallback);