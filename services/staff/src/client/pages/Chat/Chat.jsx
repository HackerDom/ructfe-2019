import * as React from 'react';
import s, { message } from './Chat.css';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';
import * as uuid from 'uuid';
import { chats } from '../../models/chats';

export class Chat extends React.Component {
    state = { messageDraft: '' };

    render () {
        return (
            <section className={s.chat}>
                <h2 className={s.chatName}>{this.props.name}</h2>
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
}
