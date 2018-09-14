import React from "react";
import { Step } from "semantic-ui-react";

const clickHandler = (onClick) => ({ onClick });
// TODO: Vis det som er valgt på hvert steg som description
const StepIndicator = ({ step, path, onClick }) => (
    <Step.Group ordered>
        <Step completed={step > 1} active={step === 1}>
            <div className={step > 1 ? 'clickable' : ''} {...(step > 1) ? clickHandler(onClick.bind(this, ExerciseStepPage.QUANTITY)) : {}}>
                <Step.Content>
                    <Step.Title>Quantity</Step.Title>
                    <Step.Description>Choose quantity to excercise</Step.Description>
                </Step.Content>
            </div>
        </Step>

        <Step completed={step > 2} active={step === 2}>
            <div className={step > 2 ? 'clickable' : ''} {...(step > 2 ? clickHandler(onClick.bind(this, ExerciseStepPage.TYPE)) : {})}>
                <Step.Content>
                    <Step.Title>Excercise type</Step.Title>
                    <Step.Description>Choose how to excercise</Step.Description>
                </Step.Content>
            </div>
        </Step>
        <Step completed={step > 3} active={step === 3}>
            <div className={step > 3 ? 'clickable' : ''} {...(step > 3) ? clickHandler(onClick.bind(this, ExerciseStepPage.TERMS)) : {}}>
                <Step.Content>
                    <Step.Title>Terms</Step.Title>
                    <Step.Description>Review terms</Step.Description>
                </Step.Content>
            </div>
        </Step>

        <Step completed={step > 4} active={step === 4}>
            <Step.Content>
                <Step.Title>Confirm Order</Step.Title>
            </Step.Content>
        </Step>
    </Step.Group>
);


export enum ExerciseStepPage {
    QUANTITY = 'QUANTITY',
    TYPE = 'TYPE',
    TERMS = 'TERMS',
    CONFIRM = 'CONFIRM',
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