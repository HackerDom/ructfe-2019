import React from 'react';
import { SelectListItem } from '../../components/SelectItemList/SelectItemList';
import s from './Chats.css';
import { Chat } from '../Chat/Chat';

export class Chats extends React.Component {
    state = {
        selectedChatId: 'id2'
    };

    render () {
        return (
            <section className={s.chats}>
                <section className={s.chatsNames}>
                    <SelectListItem
                        items={[
                            { id: 'id1', item: 'item1' },
                            { id: 'id2', item: 'item2' },
                            { id: 'id3', item: 'item3' }
                        ]}
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
}
