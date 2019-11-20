import React from 'react';
import { Registration } from '../Registration/Registration';
import { Login } from '../Login/Login';
import { Home } from '../Home/Home';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { RedirectComponent } from './RedirectComponent';
import { UserPage } from '../UserPage/UserPage';
import { Chats } from '../Chats/Chats';
import { Auth } from '../Auth/Auth';
import { UsersSearching } from '../UsersSearching/UsersSearching'

export function RouteComponent () {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact={true} component={RedirectComponent} />
                <Route path="/home" component={Home} />
                <Route path="/auth" component={Auth} />
                <Route path="/user/:id" component={UserPage} />
                <Route path="/chats" component={Chats} />
                <Route path="/search" component={UsersSearching} />
            </Switch>
        </BrowserRouter>
    );
}
