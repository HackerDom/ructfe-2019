import React from 'react';
import { Registration } from '../Registration/Registration';
import { Login } from '../Login/Login';
import { Home } from '../Home/Home';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { RedirectComponent } from './RedirectComponent';
import { UserPage } from '../UserPage/UserPage';

export function RouteComponent () {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact={true} component={RedirectComponent} />
                <Route path="/home" component={Home} />
                <Route path="/register" component={Registration} />
                <Route path="/login" component={Login} />
                <Route path="/user/:id" component={UserPage} />
            </Switch>
        </BrowserRouter>
    );
}
