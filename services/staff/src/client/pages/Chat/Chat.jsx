import * as React from 'react';
import s from './Chat.css';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';
import * as uuid from 'uuid';
import { Link } from 'react-router-dom';
import { Text } from '../../components/Text/Text';

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
                    <Button text="join" onClick={this.props.onJoinChat} />
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

    renderMessage ({ text }) {
        return (
            <section className={s.message} key={uuid()}>
                <div className={s.messageText}>{text}</div>
            </section>
        );
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
