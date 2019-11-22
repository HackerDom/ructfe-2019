import * as React from 'react';
import { Tabs } from '../../components/Tabs/Tabs';
import s from './Auth.css';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';
import { Registration } from '../Registration/Registration';
import { Login } from '../Login/Login';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Redirect } from 'react-router';

const tabs = {
    register: 'register',
    login: 'login',
    redirect: 'redirect'
};

export class Auth extends React.Component {
    state = { selectedTab: tabs.register };

    render () {
        return (
            <article className={s.auth}>
                <MarginBox>
                    <Tabs
                        tabs={[tabs.register, tabs.login]}
                        selectedTab={this.state.selectedTab}
                        onChange={this.onChangeSelectedTab}
                    />
                </MarginBox>
                <section className={s.form}>
                    <Switch by={this.state.selectedTab}>
                        <Case value={tabs.register}>
                            <Registration onRegister={this.onRegister} />
                        </Case>
                        <Case value={tabs.login}>
                            <Login onLogin={this.onLogin} />
                        </Case>
                        <Case value={tabs.redirect}>
                            <Redirect to="/chatsPage" />
                        </Case>
                    </Switch>
                </section>
            </article>
        );
    }

    onChangeSelectedTab = (selectedTab) => {
        this.setState({ selectedTab });
    };

    onRegister = () => {
        this.setState({ selectedTab: tabs.login });
    };

    onLogin = () => {
        this.setState({ selectedTab: tabs.redirect });
    };
}
