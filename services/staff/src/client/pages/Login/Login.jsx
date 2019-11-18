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
        return (
            <article className={s.login}>
                <section>
                    <MarginBox>
                        <Row>
                            <Text text="User name: " />
                            <Input
                                onChange={this.onChangeUserName}
                                value={this.state.username}
                            />
                        </Row>
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
