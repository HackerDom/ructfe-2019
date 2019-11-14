import React from 'react';
import { TextField, Button } from '@material-ui/core';
import s from './Registration.css';
import { register } from '../../models/register';

export function Registration () {
    return (
        <article className={s.formContainer}>
            <section className={s.form}>
                <TextField
                    label="Login"
                    variant="outlined"
                    onChange={register.changeUsername}
                />
                <TextField
                    label="First name"
                    variant="outlined"
                    onChange={register.changeFirstName}
                />
                <TextField
                    label="Last name"
                    variant="outlined"
                    onChange={register.changeLastName}
                />
                <TextField
                    label="Bio"
                    variant="outlined"
                    onChange={register.changeBio}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    onChange={register.changePassword}
                />
                <Button
                    color="primary"
                    variant="contained"
                    onClick={register.register}
                >
                    Register
                </Button>
            </section>
        </article>
    );
}
