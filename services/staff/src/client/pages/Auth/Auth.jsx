import * as React from 'react';
import { Tabs } from '../../components/Tabs/Tabs';
import s from './Auth.css';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';
import { Registration } from '../Registration/Registration';
import { Login } from '../Login/Login';
import { MarginBox } from '../../components/MarginBox/MarginBox';

const tabs = {
    register: 'register',
    login: 'login'
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
                <Switch by={this.state.selectedTab}>
                    <Case value={tabs.register}>
                        <Registration />
                    </Case>
                    <Case value={tabs.login}>
                        <Login />
                    </Case>
                </Switch>
            </article>
        );
    }

    onChangeSelectedTab = (selectedTab) => {
        this.setState({ selectedTab });
    };
}
