import React from 'react';
import { TextField, Button } from '@material-ui/core';
import s from './Register.css';

export function Register () {
    return (
        <article className={s.formContainer}>
            <section className={s.form}>
                <TextField
                    label="First name"
                    variant="outlined"
                />
                <TextField
                    label="Last name"
                    variant="outlined"
                />
                <TextField
                    label="Bio"
                    variant="outlined"
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                />
                <Button
                    color="primary"
                    variant="contained"
                >
                    Register
                </Button>
            </section>
        </article>
    );
}
