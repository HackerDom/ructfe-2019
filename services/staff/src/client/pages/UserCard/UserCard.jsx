import { MarginBox } from '../../components/MarginBox/MarginBox';
import { Row } from '../../components/Row/Row';
import { Text } from '../../components/Text/Text';
import { BorderBox } from '../../components/BorderBox/BorderBox';
import React from 'react';
import { Button } from '../../components/Button/Button';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';
import { Input } from '../../components/Input/Input';
import { edit } from '../../models/edit';

const cardState = {
    editing: 'editing',
    static: 'static'
};

export class UserCard extends React.Component {
    FORM_GAP = 160;
    constructor (props) {
        super(props);
        this.state = { ...props.user, cardState: cardState.static };
    }

    onEditClick = () => {
        if (this.state.cardState === cardState.editing) {
            edit.edit().then(() => { this.setState({ cardState: cardState.static }); });
        }
        if (this.state.cardState === cardState.static) {
            this.setState({ cardState: cardState.editing });
        }
    }

    onFirstNameChange = (value) => {
        edit.firstName = value;
        this.setState({ firstName: value });
    }

    onLastNameChange = (value) => {
        edit.lastName = value;
        this.setState({ lastName: value });
    }

    onBiographyChange = (value) => {
        edit.biography = value;
        this.setState({ biography: value });
    }

    render () {
        return (
            <BorderBox>
                <MarginBox style={{ width: '400px', height: '30px' }}>
                    <Row gap={this.FORM_GAP}>
                        <Text text='Username: '/>
                        <Text text={this.state.username}/>
                    </Row>
                </MarginBox>
                <MarginBox style={{ width: '400px', height: '30px' }}>
                    <Row gap={this.FORM_GAP}>
                        <Text text={'First name: '}/>
                        <Switch by={this.state.cardState}>
                            <Case value={cardState.static}>
                                <Text text={this.state.firstName}/>
                            </Case>
                            <Case value={cardState.editing}>
                                <Input value={this.state.firstName} onChange={this.onFirstNameChange}/>
                            </Case>
                        </Switch>
                    </Row>
                </MarginBox>
                <MarginBox style={{ width: '400px', height: '30px' }}>
                    <Row gap={this.FORM_GAP}>
                        <Text text={'Last name:'}/>
                        <Switch by={this.state.cardState}>
                            <Case value={cardState.static}>
                                <Text text={this.state.lastName}/>
                            </Case>
                            <Case value={cardState.editing}>
                                <Input value={this.state.lastName} onChange={this.onLastNameChange}/>
                            </Case>
                        </Switch>
                    </Row>
                </MarginBox>
                <MarginBox style={{ width: '400px', height: '30px' }}>
                    <Row gap={this.FORM_GAP}>
                        <Text text={'User\'s biography:'}/>
                        <Switch by={this.state.cardState}>
                            <Case value={cardState.static}>
                                <Text text={this.state.biography}/>
                            </Case>
                            <Case value={cardState.editing}>
                                <Input value={this.state.biography} onChange={this.onBiographyChange}/>
                            </Case>
                        </Switch>
                    </Row>
                </MarginBox>
                <MarginBox style={{ width: '400px', height: '30px' }}>
                    <div style={{ display: 'flex', width: '100%', flexDirection: 'row-reverse' }}>
                        <Switch by={this.state.cardState}>
                            <Case value={cardState.static}>
                                <Button text='Edit' onClick={this.onEditClick}/>
                            </Case>
                            <Case value={cardState.editing}>
                                <Button text='Save' onClick={this.onEditClick}/>
                            </Case>
                        </Switch>
                    </div>
                </MarginBox>
            </BorderBox>);
    }
}
