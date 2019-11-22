import React from 'react';
import { SelectListItem } from '../../components/SelectItemList/SelectItemList';
import s from './Chats.css';
import { Chat } from '../Chat/Chat';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { chats } from '../../models/chats';
import { login } from '../../models/login';
import { Switch } from '../../components/Switch/Switch';
import { Case } from '../../components/Switch/Case';
import { Text } from '../../components/Text/Text';

export class Chats extends React.Component {
    state = {
        chats: [],
        addingChatName: '',
        selectedChatId: 'none',
        selectedChatName: '',
        selectedChatMessages: [],
        selectedChatInvite: '',
        selectedChatAccess: 'loading'
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
                <Switch by={this.state.selectedChatId}>
                    <Case value="none">
                        <div className={s.centerBox}>
                            <Text text="Select chat" />
                        </div>
                    </Case>
                    <Case value="default">
                        <Chat
                            name={this.state.selectedChatName}
                            messages={this.state.selectedChatMessages}
                            onMessageSend={this.onMessageSend}
                            invite={this.state.selectedChatInvite}
                            access={this.state.selectedChatAccess}
                            onJoinChat={this.onJoinChat}
                        />
                    </Case>
                </Switch>
            </section>
        );
    }

    selectChat = (id) => {
        chats.getChatMessages(id)
            .then(messages => this.setState({
                selectedChatMessages: messages,
                selectedChatAccess: 'yes',
                selectedChatName: this.state
                    .chats
                    .find(c => c.id === id)
                    .item
            }))
            .catch((e) => this.setState({
                selectedChatAccess: 'no'
            }));
        chats.getInvite(id)
            .then(invite => this.setState({
                selectedChatInvite: invite.toString()
            }));
        this.setState({ selectedChatId: id });
    };

    createChat = () => {
        const chatName = this.state.addingChatName;
        chats.createChat()
            .then(r => {
                this.setState({
                    chats: [...this.state.chats, { id: r.chatId, item: chatName }]
                });
            });
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

    onJoinChat = (invite) => {
        const chatId = this.state.selectedChatId;

        chats.joinChat(
            chatId,
            invite
        ).then(() => this.selectChat(chatId));
    };
}
