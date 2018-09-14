import React, { Component } from 'react';
import {
    Route,
    Redirect,
    withRouter,
    RouteComponentProps,
    Link,
    Switch
} from 'react-router-dom';
import moment from 'moment';
import { Grid, Menu, Segment, Header, Button } from 'semantic-ui-react';
import './manage.less'
import { AllEmployees } from "../entity/all-employees";
import NewEmployee from "../entity/new-employee";
import { Employee, Entity, entityOptions } from "../entity/entity-workflow";

const entityRoute = '/entities';

interface State {
    entities: Entity[],
    employees: Employee[]
    showForm: boolean
}


class ManagePage extends Component<RouteComponentProps<{}>, State> {
    state = {
        entities: [],
        employees: [],
        showForm: false,
    };

    render() {
        const { match, match: { path } } = this.props;
        const activeItem = 'dashboard';
        return (
            <div className="width-limit width-limit-wide">
                <div className="flex-row">
                    <div className="manange-side-menu">
                        <Menu vertical size={"large"}>
                            <Menu.Item>
                                <Menu.Header>Data</Menu.Header>
                                <Menu.Menu>
                                    <Menu.Item name='dashboard' active={activeItem === 'dashboard'}
                                               onClick={this.handleClick} />
                                    <Menu.Item name='entities' active={false} as={Link} to={`${path}/entities`} />
                                    <Menu.Item name='employees' active={false} as={Link} to={`${path}/employees`} />
                                    <Menu.Item name='incentive-programs' active={false} as={Link}
                                               to={`${path}/programs`}>Incentive programs</Menu.Item>
                                </Menu.Menu>
                            </Menu.Item>
                            <Menu.Item>
                                <Menu.Header>Subscription</Menu.Header>
                                <Menu.Menu>
                                    <Menu.Item name='manage-subscription' active={false} as={Link}
                                               to={`${path}/subscription`}>Manage subscription</Menu.Item>
                                </Menu.Menu>
                            </Menu.Item>
                            <Menu.Item>
                                <Menu.Header>Help</Menu.Header>
                                <Menu.Menu>
                                    <Menu.Item name='overview' active={false}
                                               onClick={this.handleClick}>Overview</Menu.Item>
                                    <Menu.Item name='faq' active={false} onClick={this.handleClick}>Support</Menu.Item>
                                    <Menu.Item name='why-use' active={false} onClick={this.handleClick}>Why use
                                        incentive programs?</Menu.Item>
                                </Menu.Menu>
                            </Menu.Item>
                        </Menu>
                    </div>

                    <div className="manange-content">
                        <Switch>
                            <Route path={`${path}${entityRoute}`} render={({ match }) => (
                                <div className="width-limit width-limit-left">

                                    <h2>Entities</h2>
                                    <div className="space-vertical">
                                        {
                                            this.state.employees.length > 0 ?
                                                <div>
                                                    <AllEmployees employees={this.state.employees} />
                                                    {
                                                        this.state.showForm ?
                                                            <NewEmployee addEmployee={this.addEmployee}
                                                                         entityOptions={entityOptions(this.state.entities)} />
                                                            :
                                                            <div className={"text-center"}>
                                                                <Button primary basic onClick={this.addAnotherClicked}>
                                                                    <i className="add user icon" />
                                                                    Add another employee
                                                                </Button>
                                                            </div>
                                                    }
                                                </div>
                                                :
                                                <div className="col-center text-center">
                                                    <div className="block-s">No entities added...</div>
                                                    <Button primary basic>
                                                        <i className="add user icon" />
                                                        Add your first employee
                                                    </Button>
                                                </div>

                                        }
                                    </div>
                                </div>
                            )} />

                            <Route path={'/'} render={({ match }) => (
                                <div>
                                    <h2>Manage</h2>
                                    <div className="space-vertical">

                                    </div>
                                </div>
                            )} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }

    private addEntity = (entity: Entity) => {
        const updated = [].concat(this.state.entities, [entity]);
        this.setState({ entities: updated, showForm: false });
    }

    private addEmployee = (employee: Employee) => {
        const updated = [].concat(this.state.employees, [employee]);
        this.setState({ employees: updated, showForm: false });
    }

    private addAnotherClicked = () => this.setState({ showForm: true });
    private handleClick = () => {
    }
}

export default withRouter<{}>(ManagePage);
