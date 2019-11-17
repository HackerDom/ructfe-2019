import React from 'react';
import { observer } from 'mobx-react';
import { login } from '../../models/login';

const LoginC = observer(login => {
    return (
        <input
            value={login.username}
            onChange={login.changeUsername}
        />
    );
});

export const Login = () => (
    <LoginC login={login} />
);
