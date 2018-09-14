import React, { StatelessComponent } from 'react';
import { Message } from 'semantic-ui-react';

export enum ExerciseNotPossibleReason {
    NO_EXERCISIBLE_OPTIONS = 'NO_EXERCISIBLE_OPTIONS',
    NOT_IN_AN_EXERCISE_WINDOW = 'NOT_IN_AN_EXERCISE_WINDOW'
}

const MessageNoExercisibleOptions: StatelessComponent<{}> = () => (
    <Message
        header='Exercise not possible at the moment'
        content={`You have no exercisible options`}
    />
);

const MessageNotInAnExerciseWindow: StatelessComponent<{}> = () => (
    <Message
        header='Not in an exercise window'
        content={`Wait for an exercise window to open in order to exercise your options.`}
    />
);


const ExerciseNotPossiblePage: StatelessComponent<{ reason: ExerciseNotPossibleReason }> = ({ reason }) => (
    <div className="main-content">
        <div className="text-content-center">
            {
               reason === ExerciseNotPossibleReason.NO_EXERCISIBLE_OPTIONS && <MessageNoExercisibleOptions />
            }
            {
                reason === ExerciseNotPossibleReason.NOT_IN_AN_EXERCISE_WINDOW && <MessageNotInAnExerciseWindow />
            }
        </div>
    </div>
);

export default ExerciseNotPossiblePage;
