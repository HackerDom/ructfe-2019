import React from 'react';
import s from './UsersSearching.css';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { Input } from '../../components/Input/Input';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { BorderBox } from '../../components/BorderBox/BorderBox';
import { search } from '../../models/search';
import { Redirect } from 'react-router';
import { Case } from '../../components/Switch/Case';
import { Switch } from '../../components/Switch/Switch';

const redirectState = {
    user: 'user',
    searching: 'searching'
};
export class UsersSearching extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            username: '',
            id: '',
            firstName: '',
            lastName: '',
            redirectState: redirectState.searching
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
            .then(x => this.setState({
                id: x.id.toString(),
                username: x.username.toString()
            }));
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
                            {
                                this.state.id !== ''
                                    ? <BorderBox>
                                        <MarginBox>
                                            <Row gap={FORM_GAP}>
                                                <Text text={'First name: '}/>
                                                <Text text={this.state.firstName}/>
                                            </Row>
                                        </MarginBox>
                                        <MarginBox>
                                            <Row gap={FORM_GAP}>
                                                <Text text={'Last name: '}/>
                                                <Text text={this.state.lastName}/>
                                            </Row>
                                        </MarginBox>
                                        <MarginBox>
                                            <Row gap={FORM_GAP}>
                                                <Text text={'Username'}/>
                                                <Text text={this.state.username}/>
                                            </Row>
                                        </MarginBox>
                                        <MarginBox>
                                            <div className={s.loginButton}>
                                                <Row gap={FORM_GAP}>
                                                    <Text text={'Go to user: '}/>
                                                    <Button
                                                        onClick={this.onGoToUser}
                                                        text={this.state.username}/>
                                                </Row>
                                            </div>
                                        </MarginBox>
                                    </BorderBox> : null
                            }
                        </section>
                    </article>
                </Case>
                <Case value={redirectState.user}>
                    <Redirect to={`/usersPage?id=${this.state.id}`}/>
                </Case>
            </Switch>
        );
    }
}
