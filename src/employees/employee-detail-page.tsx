import React, { Component } from 'react';
import { Button, Form, Dropdown, DropdownItemProps, Checkbox } from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import { Employee } from "./employee-reducer";
import {changeCommaForPunctuation, changePunctuationForComma, employeeName} from "../utils/utils";
import EmployeeForm from "./employee-form";


interface Props {
    entityOptions: DropdownItemProps[],
    employee: Employee,
    editEmployee: (employee: Employee) => void,
    backHandler: () => void,
}

interface State {

}

class EmployeeDetailPage extends Component<Props, State>  {
    state = {

    };

    render() {
        const { employee, entityOptions, editEmployee, backHandler } = this.props;
        return (
            <div className="">
                <div className="block-l"/>
                <div className="block-l">
                    <h1>{employeeName(employee)}</h1>
                </div>
                <EmployeeForm
                    saveEmployee={editEmployee}
                    entityOptions={entityOptions}
                    onCloseForm={backHandler}
                    selectedEmployee={this.props.employee}
                />
            </div>
        );
    }


}

export default EmployeeDetailPage;