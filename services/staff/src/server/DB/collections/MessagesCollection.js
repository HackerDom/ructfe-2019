import { Message } from '../../entities/messageEntity';

export class MessagesCollection {
    async createMessage (ownerId, text) {
        const message = new Message();
        message.ownerId = ownerId;
        message.text = text;
        await message.save();
        return message.id;
    }
}
