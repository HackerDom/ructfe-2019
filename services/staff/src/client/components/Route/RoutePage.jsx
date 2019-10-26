import React from 'react';
import { Auth } from '../Auth/Auth';
import { Home } from '../Home/Home';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { RedirectComponent } from './RedirectComponent';

export function RoutePage () {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact={true} component={RedirectComponent} />
                <Route path="/home" component={Home} />
                <Route path="/auth" component={Auth} />
            </Switch>
        </BrowserRouter>
    );
}
