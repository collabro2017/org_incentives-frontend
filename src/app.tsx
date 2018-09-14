import React, { Component } from 'react';
import Router from './router';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { RootState } from './reducers/all-reducers';
import rootSaga from './sagas/all-sagas';
import { Provider } from 'react-redux';
import { composeWithDevTools } from "redux-devtools-extension";
import { crashReporter } from "./loggin/sentry-redux-middleware";
import Raven from 'raven-js';
import { SENTRY_DSN, SENTRY_VERSION, SENTRY_WHITELIST } from "./env";
import createHistory from "history/createBrowserHistory";
import { routerMiddleware } from "react-router-redux";

const sagaMiddleware = createSagaMiddleware();

if (SENTRY_DSN) {
    Raven.config(SENTRY_DSN, {
        whitelistUrls: SENTRY_WHITELIST,
        release: SENTRY_VERSION
    }).install();
}

const history = createHistory();

const store = createStore<RootState>(
    rootReducer,
    composeWithDevTools(
        applyMiddleware(crashReporter),
        applyMiddleware(sagaMiddleware),
        applyMiddleware(routerMiddleware(history)),
    )
);

sagaMiddleware.run(rootSaga);

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router history={history}/>
            </Provider>
        );
    }
}

export default App;
