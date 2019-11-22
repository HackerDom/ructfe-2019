import React from 'react';
import { login } from '../../models/login';
import { Input } from '../../components/Input/Input';
import s from './Login.css';
import { Button } from '../../components/Button/Button';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Snackbar } from '../../components/Snackbar/Snackbar';

export class Login extends React.Component {
    state = { login: '', password: '', error: null };

    render () {
        const FORM_GAP = 110;

        return (
            <React.Fragment>
                <MarginBox>
                    <Row gap={FORM_GAP}>
                        <Text text="Login: " />
                        <Input
                            onChange={this.onChangeLogin}
                            value={this.state.login}
                        />
                    </Row>
                </MarginBox>
                <MarginBox>
                    <Row gap={FORM_GAP}>
                        <Text text="Password: " />
                        <Input
                            type='password'
                            onChange={this.onChangePassword}
                            value={this.state.password}
                        />
                    </Row>
                </MarginBox>
                <MarginBox>
                </MarginBox>
                <MarginBox>
                    <div className={s.loginButton}>
                        <Button text="login" onClick={this.onLogin} />
                    </div>
                </MarginBox>
                <Snackbar message={this.state.error} />
            </React.Fragment>
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

    onLogin = () => {
        this.login();
    };

    async login () {
        try {
            await login.login();
            this.props.onLogin();
        } catch (e) {
            this.setState({ error: 'Login failed' });
            setTimeout(() => this.setState({ error: null }), 1000);
        }
    };
}
