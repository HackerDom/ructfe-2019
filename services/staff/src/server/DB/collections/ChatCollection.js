import { Chat } from '../../entities/chatEntity';
import uuid from 'uuid/v4';

export class ChatsCollection {
    async createChat (userCreator, name) {
        const chat = new Chat();
        chat.usersIds.push(userCreator);
        chat.name = name;
        chat.inviteLink = uuid();
        await chat.save();
        return chat.id;
    }

    async findChat (chatId) {
        return Chat.findOne({ id: chatId }, (err, chat) => {
            if (err) {
                return null;
            } else {
                return chat;
            }
        }).then(chat => {
            if (!chat) {
                throw chat;
            } else {
                return chat;
            }
        });
    }

    async getChats () {
        return Chat.findOne({}, (err, chats) => {
            if (err) {
                return null;
            } else {
                return chats;
            }
        }).then(chats => {
            if (!chats) {
                throw new Error('Chats not found');
            } else {
                return chats;
            }
        });
    }

    async saveChat (chatModel) {
        const user = new Chat(chatModel);
        return user.save();
    }
}
