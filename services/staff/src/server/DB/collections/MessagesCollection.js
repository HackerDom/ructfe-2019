import { Message } from '../../entities/messageEntity';

export class MessagesCollection {
    async createMessage (ownerId, text) {
        const message = new Message();
        message.ownerId = ownerId;
        message.text = text;
        await message.save();
        return message.id;
    }

    async getMessage (messageId) {
        return Message.findOne({ id: messageId }, (err, message) => {
            if (err) {
                return null;
            } else {
                return message;
            }
        }).then(message => {
            if (!message) {
                throw new Error('Can not find message in mongo db');
            } else {
                console.log(message);
                return message;
            }
        });
    }

    async saveMessage (messageModel) {
        const message = new Message(messageModel);
        return message.save();
    }

    async getMessages (ids) {
        return Message.find({
            id: {
                $in: [
                    ...ids
                ]
            }
        }, function (err, messages) {
            if (err) {
                return null;
            } else {
                return messages;
            }
        }).then(messages => {
            if (!messages) {
                throw messages;
            } else {
                return messages;
            }
        });
    }
}
