import React, { StatelessComponent } from "react";
import { Route, RouteComponentProps, Switch } from "react-router";

interface Props {
    showOnEveryRouteExcept: string,
    render: ((props: RouteComponentProps<any>) => React.ReactNode);
}

const InvertedRoute: StatelessComponent<Props> = (props) => {
    const { showOnEveryRouteExcept, render } = props;
    return (
        <Switch>
            <Route exact path={showOnEveryRouteExcept} />
            <Route path='/' render={render} />
        </Switch>
    )
};

export default InvertedRoute;
