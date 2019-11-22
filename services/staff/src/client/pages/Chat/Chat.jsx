import * as React from 'react';
import s from './Chat.css';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';
import * as uuid from 'uuid';
import { Link } from 'react-router-dom';
import { Text } from '../../components/Text/Text';
import { BorderBox } from '../../components/BorderBox/BorderBox';

export class Chat extends React.Component {
    state = { messageDraft: '', invite: '' };

    render () {
        if (this.props.access === 'loading') {
            return (
                <div className={s.centerBox}>
                    <Text text="loading..." />
                </div>
            );
        }

        if (this.props.access !== 'yes') {
            return (
                <div className={s.centerBox}>
                    <Text text="You have not access to this chat" />
                    <Text text="Join chat via invite" />
                    <Input
                        value={this.state.invite}
                        onChange={this.onChangeInvite}
                    />
                    <Button text="join" onClick={this.onJoinChat} />
                </div>
            );
        }

        return (
            <section className={s.chat}>
                <header className={s.header}>
                    <h2 className={s.chatName}>{this.props.name}</h2>
                    <section className={s.headerButtons}>
                        <Link to="/search">
                            <Button text="search" />
                        </Link>
                    </section>
                </header>
                <Row className={s.inviteLink}>
                    <Text text="Invite: " />
                    <Text text={this.props.invite} />
                </Row>
                <div className={s.messagesContainer}>
                    <section className={s.messages}>
                        {this.props.messages.map(this.renderMessage)}
                    </section>
                </div>
                <Row className={s.chatSender} gap={85}>
                    <Button text="send" onClick={this.onMessageSend} />
                    <Input
                        value={this.state.messageDraft}
                        onChange={this.onChangeMessageDraft}
                    />
                </Row>
            </section>
        );
    }

    renderMessage = ({ text, ownerId, id, isDeleted }) => {
        return (
            <section className={s.message} key={uuid()}>
                <BorderBox style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Link to={`/usersPage?id=${ownerId}`}>
                        <Button text='Owner' styles={{ fontSize: '12px', textAlign: 'center', margin: 'auto 0' }}/>
                    </Link>
                    <div className={s.messageText}>{text}</div>
                    {isDeleted
                        ? <Text text='DELETED' style={{ marginLeft: 'auto', fontSize: '12px' }}/>
                        : <Button text='Delete' onClick={() => this.onDeletion(id)} styles={{ marginLeft: 'auto', fontSize: '12px' }}/>}
                </BorderBox>
            </section>
        );
    }

    onDeletion = (id) => {
        fetch('/deleteMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageId: id
            })
        }).catch(x => console.log(x))
            .then(x => {
                this.props.readMessages();
            });
    }

    onChangeMessageDraft = (message) => {
        this.setState({ messageDraft: message });
    };

    onMessageSend = () => {
        this.props.onMessageSend(this.state.messageDraft);
        this.setState({
            messageDraft: ''
        });
    };

    onChangeInvite = (invite) => {
        this.setState({ invite });
    };

    onJoinChat = () => {
        this.props.onJoinChat(this.state.invite);
    };
}
