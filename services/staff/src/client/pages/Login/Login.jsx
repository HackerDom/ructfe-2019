import React from 'react';
import { login } from '../../models/login';
import { Input } from '../../components/Input/Input';
import s from './Login.css';
import { Button } from '../../components/Button/Button';
import { MarginBox } from '../../components/MarginBox/MarginBox';

export class Login extends React.Component{
    state = { username: '' };

    render () {
        return (
            <article className={s.login}>
                <section>
                    <MarginBox>
                        <Input
                            onChange={this.onChangeUserName}
                            value={this.state.username}
                        />
                    </MarginBox>
                    <MarginBox>
                        <Button text="login" />
                    </MarginBox>
                </section>
            </article>
        );
    }

    onChangeUserName = (username) => {
        login.username = username;
        this.setState({ username });
    };
}
