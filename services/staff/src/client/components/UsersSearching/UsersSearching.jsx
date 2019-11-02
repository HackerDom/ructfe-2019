import React from 'react';
import s from './UsersSearching.css';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Button, TextField, Link } from '@material-ui/core';

export class UsersSearching extends React.Component {
    constructor (props) {
        super(props);
        this.state = { users: [] };
    }

    search = () => {
        fetch('/searchUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    firstName: this.state.firstName,
                    lastName: this.state.lastName
                }
            })
        })
            .then(response => {
                response.json().then(json => {
                    this.setState({ users: json.users });
                });
            })
            .catch(error => console.error(error));
    }

    changeLastName = (lastNameEvent) => {
        this.setState({ lastName: lastNameEvent.target.value });
    }

    changeFirstName = (firstNameEvent) => {
        this.setState({ firstName: firstNameEvent.target.value });
    }

    render () {
        return (<article className={s.formContainer}>
            <section className={s.outerForm}>
                <Typography className={s.field} variant="h4" component="h3">
                    Search user with:
                </Typography>
                <section className={s.form}>
                    <TextField
                        label="First name"
                        variant="outlined"
                        onChange={this.changeFirstName}
                    />
                    <TextField
                        label="Last name"
                        variant="outlined"
                        onChange={this.changeLastName}
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.search}
                    >
                        Search
                    </Button>
                </section>
                <Paper className={s.root}>
                    {this.state.users.map(user => (
                        <div>
                            <Link href={`/user/${user.id}`}>
                                {user.username}
                            </Link>
                        </div>)
                    )}
                </Paper>
            </section>
        </article>
        );
    }
}
