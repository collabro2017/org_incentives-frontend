import React, { Component } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Window } from "../data/data";
import { Button, Icon } from 'semantic-ui-react';
import { exerciseRoute } from "../menu/menu";
import { Link } from 'react-router-dom';
import '../less/banner.less';
import { vestedAwards } from "../instruments/instruments-page";
import { sum } from "../utils/utils";
import { RootState } from "../reducers/all-reducers";

interface StateProps {
    currentWindow: Window,
    nextWindow: Window,
    vestedOptionsQuantity: number,
}

interface State {
}

class ExerciseBanner extends Component<StateProps, State> {
    render() {
        const { currentWindow, vestedOptionsQuantity, nextWindow } = this.props;

        if (!currentWindow) {
            if (nextWindow) {
               return (
                   <div className="banner">
                       <Icon name="info circle" inverted className="banner-icon" size="big"/>
                       <span>Next exercise window will be from {nextWindow.from.format('lll')} to {nextWindow.to.format('lll')}.</span>
                   </div>
               );
            }

            return null;
        }

        if (vestedOptionsQuantity === 0) {
            return null;
        }

        return (
            <div className="banner">
                <Icon name="info circle" inverted className="banner-icon" size="big"/>
                <span>Current exercise window closes on {currentWindow.to.format('lll')}.</span>
                <Button className="banner-button" inverted basic content="Start Exercising" as={Link} to={exerciseRoute} />
            </div>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ user, instrument }): StateProps => ({
    currentWindow: user.currentExerciseWindow,
    nextWindow: user.nextExerciseWindow,
    vestedOptionsQuantity: instrument.options.filter(vestedAwards).reduce(sum('quantity'), 0),
});

export default connect(mapStateToProps)(ExerciseBanner);
