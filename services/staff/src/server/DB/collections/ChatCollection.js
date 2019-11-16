import { Chat } from '../../entities/chatEntity';

export class ChatsCollection {
    async createChat (userCreator, name) {
        const chat = new Chat();
        chat.usersIds.push(userCreator);
        chat.name = name;
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
        return Chat.find({}, null);
    }

    async saveChat (chatModel) {
        const user = new Chat(chatModel);
        return user.save();
    }
}
