import React from 'react';
import s from './UserPage.css';
import { Text } from '../../components/Text/Text';
import { MarginBox } from '../../components/MarginBox/MarginBox';
import { BorderBox } from '../../components/BorderBox/BorderBox';
import { Row } from '../../components/Row/Row';

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
                    this.setState({ user: { ...json.data } });
                });
            })
            .catch(error => console.error(error));
    }

    render () {
        const FORM_GAP = 160;
        return (<article className={s.formContainer}>
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
        </article>
        );
    }
}
