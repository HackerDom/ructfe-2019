import * as React from 'react';
import s from './Chat.css';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Row } from '../../components/Row/Row';

export class Chat extends React.Component {
    state = { name: 'Chat name', messageDraft: '' };

    render () {
        return (
            <section className={s.chat}>
                <h2 className={s.chatName}>{this.state.name}</h2>
                <section className={s.messages} />
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

    onChangeMessageDraft = (message) => {
        this.setState({ messageDraft: message });
    };

    onMessageSend = () => {

    };
}
