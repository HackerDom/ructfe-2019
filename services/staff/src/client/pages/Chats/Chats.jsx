import React from 'react';
import { SelectListItem } from '../../components/SelectItemList/SelectItemList';
import s from './Chats.css';
import { Chat } from '../Chat/Chat';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { chats } from '../../models/chats';

export class Chats extends React.Component {
    state = {
        chats: [],
        selectedChatId: 'id2',
        chatName: ''
    };

    render () {
        return (
            <section className={s.chats}>
                <section className={s.chatsNames}>
                    <section className={s.chatCreation}>
                        <Input
                            value={this.state.chatName}
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
                <Chat />
            </section>
        );
    }

    selectChat = (id) => {
        this.setState({ selectedChatId: id });
    };

    createChat = () => {
        chats
            .createChat()
            ;
    };

    onChangeChatName = (chatName) => {
        chats.chatName = chatName;
        this.setState({ chatName });
    };
}
