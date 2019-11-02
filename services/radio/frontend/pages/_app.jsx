import PropTypes from 'prop-types';

import { createBrowserHistory } from 'history';
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';

import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import React from 'react';

import MainPage from './main';
import RegisterPage from './register';
import LoginPage from './login';

import makeReducers from '../reducers';

const history = createBrowserHistory();

export default class RadioApp extends React.Component {
    static propTypes = {
        initialProps: PropTypes.shape({
            isDebug: PropTypes.bool
        }),
    }

    constructor(props, context) {
        super(props, context);

        const thunk = thunkMiddleware;

        const middlewares = [thunk];
        if (props.initialProps.isDebug) {
            middlewares.push(loggerMiddleware);
        }
        this.store = createStore(
            makeReducers(props.initialProps, history),
            applyMiddleware(
                routerMiddleware(history),
                ...middlewares
            )
        );
    }

    render() {
        return <Provider store={this.store}>
            <ConnectedRouter history={history}>
                <Switch>
                    <Route exact path='/signup/*' component={RegisterPage}></Route>
                    <Route exact path='/signin/*' component={LoginPage}></Route>
                    <Route exact path='/' component={MainPage}></Route>
                </Switch>
            </ConnectedRouter>
        </Provider>;
    }
}
