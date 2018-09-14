import React, { Component } from 'react';
import moment, {Moment} from 'moment';
import { Form, Button, Checkbox } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import { SharePrice } from "./share-price-reducer";

interface Props {
    closeFormClicked: () => void,
    addSharePrice: (sharePrice: SharePrice) => void
}

interface State {
    price: string,
    date: Moment,
    manual: boolean,
    message: string
}

class NewSharePrice extends Component<Props, State> {

    state = {
        price: "0",
        date: moment(),
        manual: false,
        message: ''
    };

    render() {
        return (
            <div className="form-greyscale">
                <Form size={"large"}>
                    <Form.Field width={8}>
                        <label>Share Price</label>
                        <input placeholder='Stock price' value={this.state.price}
                               onChange={this.handleChange.bind(this, 'price')}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Date</label>
                        <DatePicker placeholderText="Date (dd.mm.yy)" dateFormat='DD.MM.YY'
                                    selected={this.state.date}
                                    className='sharePriceDatePickerInput'
                                    onChange={this.handleDateChange.bind(this, 'date')}/>
                    </Form.Field>
                    <div className="block-m">
                        <Form.Field width={8}>
                            <label>Message</label>
                            <input placeholder='message' value={this.state.message}
                                   onChange={this.handleChange.bind(this, 'message')}/>
                        </Form.Field>
                        <Form.Field inline width={8}>
                            <Checkbox label='Manual' checked={this.state.manual}
                                      onChange={this.handleToggleChange}/>
                        </Form.Field>
                    </div>
                    <div className="text-center">
                        <Button.Group>
                            <Button type='button' onClick={this.props.closeFormClicked}>Cancel</Button>
                            <Button.Or />
                            <Button positive type='button' onClick={this.saveSharePrice}>Save Share Price</Button>
                        </Button.Group>
                    </div>
                </Form>
            </div>
        )
    }

    private handleChange = (key, event) => {
        let updateObject = {};
        updateObject[key] = event.target.value;
        this.setState(updateObject);
    };

    private handleDateChange = (key, date) => {
        this.setState({ [key]: date })
    };

    private handleToggleChange = () => {
        this.setState({ manual: !this.state.manual })
    };

    private saveSharePrice = () => {
        const stockPrice = {
            price: parseFloat(this.state.price.replace(',', '.')).toString(),
            date: this.state.date,
            manual: this.state.manual,
            message: this.state.message
        };

        this.props.addSharePrice(stockPrice);
    }
}

export default NewSharePrice;