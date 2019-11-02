import React from 'react';
import { TextField, Button } from '@material-ui/core';
import s from './Login.css';
import { login } from '../../models/login';

export function Login () {
    return (
        <article className={s.formContainer}>
            <section className={s.form}>
                <TextField
                    label="Login"
                    variant="outlined"
                    onChange={login.changeUsername}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    onChange={login.changePassword}
                />
                <Button
                    color="primary"
                    variant="contained"
                    onClick={login.login}
                >
                    Login
                </Button>
            </section>
        </article>
    );
}
