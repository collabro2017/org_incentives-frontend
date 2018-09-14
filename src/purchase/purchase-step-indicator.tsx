import React, { StatelessComponent } from "react";
import { Step } from "semantic-ui-react";
import { ExerciseStepPage } from "../exercise/exercise-step-indicator";

const clickHandler = (onClick) => ({ onClick });

interface StepIndicatorProps {
    data: StepIndicatorData[],
    onClick: (clickedIndex: number) => void,
    activeIndex: number,
}


export const StepIndicator: StatelessComponent<StepIndicatorProps> = ({ activeIndex, onClick, data }) => (
    <Step.Group ordered>
        {
            data.map((step, index) => (
                <Step completed={step.completed} active={step.active} key={index}>
                    <div className={step.clickable ? 'clickable' : ''} {...(step.clickable) ? clickHandler(onClick.bind(this, index)) : {}}>
                        <Step.Content>
                            <Step.Title>{step.title}</Step.Title>
                            <Step.Description>{step.description}</Step.Description>
                        </Step.Content>
                    </div>
                </Step>
            ))
        }
    </Step.Group>
);

export interface StepIndicatorData  {
    title: string,
    description?: string,
    clickable?: boolean,
    active: boolean,
    completed: boolean,
}



export const stepFromCurrentPage = (currentPage: ExerciseStepPage) => {
    if (currentPage === ExerciseStepPage.QUANTITY) {
        return 1;
    }

    else if (currentPage === ExerciseStepPage.TYPE) {
        return 2;
    }

    else if (currentPage === ExerciseStepPage.TERMS) {
        return 3;
    }

    else if (currentPage === ExerciseStepPage.CONFIRM) {
        return 4;
    }
    else {
        return 5;
    }
};


export default StepIndicator;