import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { connect, MapDispatchToProps } from "react-redux";

const websiteUrl = 'https://www.optioincentives.no/';

interface DispatchProps {
    logoutRequested: () => void,
}

class LogoutPage extends Component<DispatchProps> {
    componentWillMount() {
        this.props.logoutRequested();
    }

    render() {
        return (
            <div className='section-container text-center main-content'>
                <h1 className='block-l'>You are now logged out</h1>
                <div className="text-center ">
                    <Button primary size='big' as={Link} to={'/login'}>Log back in</Button>
                    <a href={websiteUrl} className='webpage-link'>Go to our web page</a>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, any> = (dispatch): DispatchProps => ({
    logoutRequested: () => dispatch({ type: 'LOGOUT_REQUESTED' })
});

export default connect(null, mapDispatchToProps)(LogoutPage);
