import React, { Component } from 'react';
import { connect, MapDispatchToProps } from "react-redux";

interface DispatchProps {
    loginRequested: () => void,
}

class LoginPage extends Component<DispatchProps> {
    componentDidMount() {
        this.props.loginRequested();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, any> = (dispatch): DispatchProps => ({
    loginRequested: () => dispatch({ type: 'LOGIN_REQUESTED' })
});

export default connect(null, mapDispatchToProps)(LoginPage);
