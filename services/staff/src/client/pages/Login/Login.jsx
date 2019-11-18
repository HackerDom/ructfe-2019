import React from 'react';
import { observer } from 'mobx-react';
import { login } from '../../models/login';
import { Input } from '../../components/Input/Input';
import s from './Login.css';

const LoginComponent = observer(login => {
    return (
        <article className={s.login}>
            <section>
                <Input
                    value={login.username}
                    onChange={login.changeUsername}
                />
            </section>
        </article>
    );
});

export const Login = () => (
    <LoginComponent login={login} />
);
