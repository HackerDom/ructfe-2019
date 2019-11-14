import React from 'react';
import s from './UserPage.css';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export class UserPage extends React.Component {
    constructor (props) {
        super(props);
        this.state = { id: props.match.params.id };
    }

    componentDidMount () {
        fetch(`/user?userId=${this.state.id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        })
            .then(response => {
                response.json().then(json => {
                    this.setState({ user: { ...json } });
                });
            })
            .catch(error => console.error(error));
    }

    render () {
        console.log(this.state);
        return (<article className={s.formContainer}>
            <section className={s.form}>
                <Paper className={s.root}>
                    <div className={s.contentWrapper}>
                        <Typography className={s.field} variant="h4" component="h3">
                        Username: {this.state.user ? this.state.user.username : undefined}
                        </Typography>
                        <Typography className={s.field} variant="h5" component="h3">
                        First name: {this.state.user ? this.state.user.firstName : undefined}
                        </Typography>
                        <Typography className={s.field} variant="h5" component="h3">
                        Last name: {this.state.user ? this.state.user.lastName : undefined}
                        </Typography>
                        <Typography className={s.field} component="p">
                        User's biography: <br/>
                            {this.state.user ? this.state.user.biography : undefined}
                        </Typography>
                    </div>
                </Paper>
            </section>
        </article>
        );
    }
}
