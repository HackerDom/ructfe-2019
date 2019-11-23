import React from 'react';
import s from './UserPage.css';
import { Text } from '../../components/Text/Text';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { BorderBox } from '../../components/BorderBox/BorderBox';
import { UserCard } from '../UserCard/UserCard';
import { Row } from '../../components/Row/Row';
import queryString from 'query-string';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';

const states = {
    notExist: 'notExist',
    found: 'found'
};

export class UserPage extends React.Component {
    constructor (props) {
        super(props);
        const values = queryString.parse(this.props.location.search);
        this.state = { id: values.id, userState: states.notExist };
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
                    this.setState({ user: { ...json.data, id: this.state.id } });
                    if (json.success) {
                        this.setState({ userState: states.found });
                    }
                });
            })
            .catch(error => console.error(error));
    }

    render () {
        return (<article className={s.formContainer}>
            <Switch by={this.state.userState}>
                <Case value={states.found}>
                    <UserCard user={this.state.user}/>
                </Case>
                <Case value={states.notExist}>
                    <BorderBox>
                        <Text text='User was not found'/>
                    </BorderBox>
                </Case>
            </Switch>
        </article>
        );
    }
}
