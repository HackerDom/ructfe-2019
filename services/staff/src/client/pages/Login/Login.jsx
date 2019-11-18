import React from 'react';
import { login } from '../../models/login';
import { Input } from '../../components/Input/Input';
import s from './Login.css';
import { Button } from '../../components/Button/Button';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';

export class Login extends React.Component {
    state = { login: '', password: '' };

    render () {
        const FORM_GAP = 110;

        return (
            <section>
                <Row gap={FORM_GAP}>
                    <Text text="Login: " />
                    <Input
                        onChange={this.onChangeLogin}
                        value={this.state.login}
                    />
                </Row>
                <MarginBox>
                    <Row gap={FORM_GAP}>
                        <Text text="Password: " />
                        <Input
                            onChange={this.onChangePassword}
                            value={this.state.password}
                        />
                    </Row>
                </MarginBox>
                <MarginBox>
                </MarginBox>
                <MarginBox alignCenter={true}>
                    <Button text="login" onClick={login.login} />
                </MarginBox>
            </section>
        );
    }

    onChangeLogin = (loginValue) => {
        login.username = loginValue;
        this.setState({ login: loginValue });
    };

    onChangePassword = (password) => {
        login.password = password;
        this.setState({ password });
    };
}
