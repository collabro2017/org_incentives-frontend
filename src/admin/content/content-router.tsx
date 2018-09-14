import React, { StatelessComponent } from 'react';
import { match, Route, Switch } from "react-router";
import { Menu } from "semantic-ui-react";
import { Link, Redirect } from "react-router-dom";
import ContentManagementPage from "./content-management-page";
import DefaultTextsManagementPage from "./default-texts-management-page";
import { Location } from "history";

interface Props {
    match: match<{}>,
    location: Location,
}

const ContentRouter: StatelessComponent<Props> = ({ match, location }) => (
    <div>
        <div className="col-center block-m">
            <Menu pointing secondary>
                <Menu.Item name='Emails' active={location.pathname && location.pathname.startsWith(`${match.path}/emails`)} as={Link} to={`${match.path}/emails`} />
                <Menu.Item name='Texts' active={location.pathname && location.pathname.startsWith(`${match.path}/texts`)} as={Link} to={`${match.path}/texts`} />
            </Menu>
        </div>
        <Switch>
            <Route path={`${match.path}/emails`} render={({ match }) => (
                <ContentManagementPage match={match} />
            )} />
            <Route
                path={`${match.path}/texts`}
                render={({ match }) => (
                    <DefaultTextsManagementPage />
                )}
            />
            <Redirect to={`${match.path}/emails`}/>
        </Switch>
    </div>
);

export default ContentRouter;
