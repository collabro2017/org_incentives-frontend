import React, { StatelessComponent } from "react";
import { Loader, Dimmer } from 'semantic-ui-react';

interface Props {
    active: boolean,
}

const SpinnerInline: StatelessComponent<Props> = ({ active }) => (
    <div className="loader-container">
        <Loader active={active} size='big'/>
    </div>
);

export default SpinnerInline;
