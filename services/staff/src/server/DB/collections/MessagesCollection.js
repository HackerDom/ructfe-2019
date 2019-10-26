import { Message } from '../../entities/messageEntity';

export class MessagesCollection {
    async createMessage (ownerId, text) {
        const message = new Message();
        message.ownerId = ownerId;
        message.text = text;
        await message.save();
        return message.id;
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
