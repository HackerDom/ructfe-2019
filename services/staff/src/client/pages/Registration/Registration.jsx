import React from 'react';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { register } from '../../models/register';
import s from './Registration.css';
import { Snackbar } from '../../components/Snackbar/Snackbar';

export class Registration extends React.Component {
    state = {
        firstName: '',
        lastName: '',
        login: '',
        password: '',
        error: null
    };

    render () {
        const FORM_GAP = 110;

        return (
            <React.Fragment>
                <MarginBox>
                    <Row gap={FORM_GAP}>
                        <Text text="First name: " />
                        <Input
                            onChange={this.onChangeFirstName}
                            value={this.state.firstName}
                        />
                    </Row>
                </MarginBox>
                <MarginBox>
                    <Row gap={FORM_GAP}>
                        <Text text="Last name: " />
                        <Input
                            onChange={this.onChangeLastName}
                            value={this.state.lastName}
                        />
                    </Row>
                </MarginBox>
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
                    <div className={s.registerButton}>
                        <Button
                            text="register"
                            onClick={this.onRegister}
                        />
                    </div>
                </MarginBox>
                <Snackbar message={this.state.error} />
            </React.Fragment>
        );
    }

    onChangeFirstName = (firstName) => {
        register.firstName = firstName;
        this.setState({ firstName });
    };

    onChangeLastName = (lastName) => {
        register.lastName = lastName;
        this.setState({ lastName });
    };

    onChangeLogin = (login) => {
        register.username = login;
        this.setState({ login });
    };

    onChangePassword = (password) => {
        register.password = password;
        this.setState({ password });
    };

    onRegister = () => {
        register
            .register()
            .then(this.props.onRegister);
    };

    async register () {
        try {
            await register.register();
            this.props.onRegister();
        } catch (e) {
            this.setState({ error: 'Registration failed' });
        }
    }
}
