import Raven from 'raven-js';

// From blog post: https://blog.sentry.io/2016/08/24/redux-middleware-error-logging.html

export const crashReporter = store => next => action => {
    try {
        Raven.captureBreadcrumb({
            message: action.type,
            category: 'redux-action'
        });
        return next(action); // dispatch
    } catch (err) {
        console.error('Caught an exception!', err);
        Raven.captureException(err, { // send to crash reporting tool
            extra: {
                action,
                state: store.getState() // dump application state
            }
        });
        throw err; // re-throw error
    }
};
