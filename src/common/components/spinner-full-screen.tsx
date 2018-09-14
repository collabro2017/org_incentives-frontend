import React, { StatelessComponent } from "react";
import { Loader, Dimmer } from 'semantic-ui-react';

interface Props {
    active: boolean,
    text?: string,
}

const SpinnerFullScreen: StatelessComponent<Props> = ({ active, text }) => (
    <div className="loader-full-screen">
        <Dimmer active={active}>
            <Loader size="big">{text}</Loader>
        </Dimmer>
    </div>
);

export default SpinnerFullScreen;
