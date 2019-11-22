import React from 'react';
import s from './UsersSearching.css';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Input } from '../../components/Input/Input';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { search } from '../../models/search';
import { Redirect } from 'react-router';
import { Case } from '../../components/Switch/Case';
import { Switch } from '../../components/Switch/Switch';
import { FoundedUsersContainer } from '../FoundedUsersContainer/FoundedUsersContainer';

const redirectState = {
    user: 'user',
    searching: 'searching'
};
const states = {
    empty: 'empty',
    found: 'found',
    notFound: 'notFound'
};

export class UsersSearching extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            user: {
                username: '',
                firstName: '',
                lastName: '',
                id: ''
            },
            firstName: '',
            lastName: '',
            redirectState: redirectState.searching,
            searchState: states.empty
        };
    }

    changeLastName = (value) => {
        search.lastName = value;
        this.setState({ lastName: value });
    };

    changeFirstName = (value) => {
        search.firstName = value;
        this.setState({ firstName: value });
    };

    onSearch = () => {
        search
            .search()
            .then(x => {
                if (x) {
                    this.setState({
                        user: {
                            id: x.id.toString(),
                            username: x.username.toString(),
                            firstName: this.state.firstName,
                            lastName: this.state.lastName
                        },
                        searchState: states.found
                    });
                } else {
                    this.setState({ searchState: states.notFound });
                }
            });
    };

    onGoToUser = () => {
        this.setState({ redirectState: redirectState.user });
    };

    render () {
        const FORM_GAP = 110;
        return (
            <Switch by={this.state.redirectState}>
                <Case value={redirectState.searching}>
                    <article className={s.formContainer}>
                        <section>
                            <Text text="Search user with: " style={{
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}/>
                            <section>
                                <MarginBox>
                                    <Row gap={FORM_GAP}>
                                        <Text text="First name"/>
                                        <Input
                                            onChange={this.changeFirstName}
                                            value={this.state.firstName}
                                        />
                                    </Row>
                                </MarginBox>
                                <MarginBox>
                                    <Row gap={FORM_GAP}>
                                        <Text text="Last name"/>
                                        <Input
                                            onChange={this.changeLastName}
                                            value={this.state.lastName}
                                        />
                                    </Row>
                                </MarginBox>

                                <MarginBox>
                                </MarginBox>
                                <Button text="Search" onClick={this.onSearch}/>
                                <MarginBox>
                                </MarginBox>
                            </section>
                            <FoundedUsersContainer
                                searchState={this.state.searchState}
                                user={this.state.user}
                                onGoToUser={this.onGoToUser}/>
                        </section>
                    </article>
                </Case>
                <Case value={redirectState.user}>
                    <Redirect to={`/usersPage?id=${this.state.user.id}`}/>
                </Case>
            </Switch>
        );
    }
}
