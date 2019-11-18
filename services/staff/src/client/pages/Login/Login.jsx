import React from 'react';
import { login } from '../../models/login';
import { Input } from '../../components/Input/Input';
import s from './Login.css';
import { Button } from '../../components/Button/Button';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';

export class Login extends React.Component {
    state = { username: '' };

    render () {
        const FORM_GAP = 110;

        return (
            <article className={s.login}>
                <section>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text="Name: " />
                            <Input
                                onChange={this.onChangeUserName}
                                value={this.state.username}
                            />
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text="Last name: " />
                            <Input
                                onChange={this.onChangeUserName}
                                value={this.state.username}
                            />
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text="Password: " />
                            <Input
                                onChange={this.onChangeUserName}
                                value={this.state.username}
                            />
                        </Row>
                    </MarginBox>
                    <MarginBox>
                        <Row gap={FORM_GAP}>
                            <Text text="Login: " />
                            <Input
                                onChange={this.onChangeUserName}
                                value={this.state.username}
                            />
                        </Row>
                    </MarginBox>
                    <MarginBox alignCenter={true}>
                        <div className={s.loginButton}>
                            <Button text="login" />
                        </div>
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
