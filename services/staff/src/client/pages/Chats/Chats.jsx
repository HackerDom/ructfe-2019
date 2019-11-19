import React from 'react';
import { SelectListItem } from '../../components/SelectItemList/SelectItemList';

export class Chats extends React.Component {
    state = { selectedChatId: 'id2' };

    render () {
        return (
            <SelectListItem
                items={[
                    { id: 'id1', item: 'item1' },
                    { id: 'id2', item: 'item2' },
                    { id: 'id3', item: 'item3' }
                ]}
                selectedId={this.state.selectedChatId}
                onChange={this.selectChat}
            />
        );
    }

    selectChat = (id) => {
        this.setState({ selectedChatId: id });
    };
}
