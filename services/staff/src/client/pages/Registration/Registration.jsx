import React from 'react';
import s from '../Login/Login.css';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { register } from '../../models/register';

export class Registration extends React.Component {
    state = {
        firstName: '',
        lastName: '',
        login: '',
        password: ''
    };

    render () {
        const FORM_GAP = 110;

        return (
            <article className={s.login}>
                <section>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text="Name: " />
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
                                onChange={this.onChangePassword}
                                value={this.state.password}
                            />
                        </Row>
                    </MarginBox>
                    <MarginBox alignCenter={true}>
                        <Button text="register" onClick={register.register} />
                    </MarginBox>
                </section>
            </article>
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
}
