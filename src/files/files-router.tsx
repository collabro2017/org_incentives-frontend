import React, { StatelessComponent } from 'react';
import { match, Route, Switch } from "react-router";
import { Menu } from "semantic-ui-react";
import { Link, Redirect } from "react-router-dom";
import FilesManagementPage from "./files-management-page";
import AcceptedStatusPage from './accepted-status-registary';
import { Location } from "history";

interface Props {
    match: match<{}>,
    location: Location,
}

const filesRoute = (match: match<{}>) => `${match.path}/files`;
const acceptanceRoute = (match: match<{}>) => `${match.path}/acceptance`;

const FilesRouter: StatelessComponent<Props> = ({ match, location }) => (
    <div>
        <div className="col-center block-m">
            <Menu pointing secondary>
                <Menu.Item name='Files' active={location.pathname && location.pathname.startsWith(filesRoute(match))} as={Link} to={filesRoute(match)} />
                <Menu.Item name='Acceptance' active={location.pathname && location.pathname.startsWith(acceptanceRoute(match))} as={Link} to={acceptanceRoute(match)} />
            </Menu>
        </div>
        <Switch>
            <Route path={filesRoute(match)} render={(routeComponentProps) => (
                <FilesManagementPage {...routeComponentProps} />
            )} />
            <Route
                path={acceptanceRoute(match)}
                render={({ match }) => (
                    <AcceptedStatusPage />
                )}
            />
            <Redirect to={filesRoute(match)}/>
        </Switch>
    </div>
);

export default FilesRouter;
