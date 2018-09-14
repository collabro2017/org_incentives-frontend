import React, { Component } from 'react';
import { Route, Switch } from "react-router";
import AwardManagementPage from "./awards-management-page";

interface Props {

}

interface State {}

class AwardRouter extends Component<Props, State> {
    render() {
        return (
            <div>
                <Route path={"/"} render={({ match }) => <AwardManagementPage match={match} />}/>
            </div>
        );
    }
}

export default AwardRouter;
