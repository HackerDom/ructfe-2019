import React from 'react';
import { SelectListItem } from '../../components/SelectItemList/SelectItemList';
import s from './Chats.css';
import { Chat } from '../Chat/Chat';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { chats } from '../../models/chats';
import { login } from '../../models/login';

export class Chats extends React.Component {
    state = {
        chats: [],
        addingChatName: '',
        selectedChatId: 'none',
        selectedChatName: '',
        selectedChatMessages: []
    };

    componentDidMount () {
        chats.getChats()
            .then(chats => {
                chats = chats.map(c => ({ id: c.id, item: c.name }));
                this.setState({ chats });
            });
    }

    render () {
        return (
            <section className={s.chats}>
                <section className={s.chatsNames}>
                    <section className={s.chatCreation}>
                        <Input
                            value={this.state.addingChatName}
                            onChange={this.onChangeChatName}
                        />
                        <Button text="create chat" onClick={this.createChat} />
                    </section>
                    <SelectListItem
                        items={this.state.chats}
                        selectedId={this.state.selectedChatId}
                        onChange={this.selectChat}
                    />
                </section>
                <section className={s.divider} />
                <Chat
                    name={this.state.selectedChatName}
                    messages={this.state.selectedChatMessages}
                    onMessageSend={this.onMessageSend}
                />
            </section>
        );
    }

    selectChat = (id) => {
        chats.getChatMessages(id)
            .then(messages => this.setState({
                selectedChatMessages: messages,
                selectedChatName: this.state
                    .chats
                    .find(c => c.id === id)
                    .item
            }));
        this.setState({ selectedChatId: id });
    };

    createChat = () => {
        chats.createChat();
        this.setState({ addingChatName: '' });
    };

    onChangeChatName = (chatName) => {
        chats.chatName = chatName;
        this.setState({ addingChatName: chatName });
    };

    onMessageSend = (message) => {
        chats.sendMessage(
            this.state.selectedChatId,
            message
        )
            .then(r => this.setState({
                selectedChatMessages: [
                    ...this.state.selectedChatMessages,
                    { id: r.id, text: message, ownerId: login.userId }
                ]
            }));
    };
}