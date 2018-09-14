import React, { StatelessComponent } from "react";
import { Icon, Popup, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import numeral from "numeral";
import { Window } from "../data/data";

export const ExerciseWindowBox: StatelessComponent<{ window: Window, vestedTotalValue: number }> = ({ window, vestedTotalValue }) => (
    <div className="box-headed">
        <div className="box-headed-header">
            <Icon name='clock' size='big' />
            <span className="box-headed-header-text">Available for exercise</span>
            <Popup
                trigger={<Icon name='question circle outline' size="big" />}
                header='Exercise Opportunities'
                content='Your employer will regularly allow employees to excercise vested options. All information regarding exercises windows will appear here. '
            />
        </div>
        <div className="box-headed-content">
            <p className="text-secondary">Available (vested) instruments can now be exercised. The
                exercise window closes on {window.to.format("DD.MM.YYYY")}</p>
            <div className="divider-m" />
            <div className="box-num-container-center">
                                <span
                                    className="box-num-highlight box-num-highlight-positive">{numeral(vestedTotalValue).format('0,0 $')}</span>
                <span
                    className="box-num-subtitle box-num-subtitle-center">ESTIMATED GAIN OF AVAILABLE INSTRUMENTS</span>
            </div>
            <div className="divider-m" />
            <div className="box-num-container-center">
                <Link to={`/exercise`}>
                    <Button positive content='Start exercising' icon='right arrow' labelPosition='right'
                            size="big" />
                </Link>
            </div>
        </div>
    </div>
);
