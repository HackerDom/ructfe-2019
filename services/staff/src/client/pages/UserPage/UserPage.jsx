import React from 'react';
import s from './UserPage.css';
import { Text } from '../../components/Text/Text';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { BorderBox } from '../../components/BorderBox/BorderBox';
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
                    this.setState({ user: { ...json.data } });
                    if (json.success) {
                        this.setState({ userState: states.found });
                    }
                });
            })
            .catch(error => console.error(error));
    }

    render () {
        const FORM_GAP = 160;
        return (<article className={s.formContainer}>
            <Switch by={this.state.userState}>
                <Case value={states.found}>
                    <BorderBox>
                        <MarginBox>
                            <Row gap={FORM_GAP}>
                                <Text text='Username: '/>
                                <Text text={this.state.user ? this.state.user.username : undefined}/>
                            </Row>
                        </MarginBox>
                        <MarginBox>
                            <Row gap={FORM_GAP}>
                                <Text text={'First name: '}/>
                                <Text text={this.state.user ? this.state.user.firstName : undefined}/>
                            </Row>
                        </MarginBox>
                        <MarginBox>
                            <Row gap={FORM_GAP}>
                                <Text text={'Last name:'}/>
                                <Text text={this.state.user ? this.state.user.lastName : undefined}/>
                            </Row>
                        </MarginBox>
                        <MarginBox>
                            <Row gap={FORM_GAP}>
                                <Text text={'User\'s biography:'}/>
                                <Text text={this.state.user ? this.state.user.biography : undefined}/>
                            </Row>
                        </MarginBox>
                    </BorderBox>
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
