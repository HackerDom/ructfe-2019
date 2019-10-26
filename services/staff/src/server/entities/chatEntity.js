import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

autoIncrement.initialize(mongoose.connection);

const chatSchema = new mongoose.Schema({
    id: String,
    messagesIds: Array,
    usersIds: Array
});

chatSchema.index({
    id: 1
}, {
    unique: true
});

chatSchema.plugin(autoIncrement.plugin, {
    model: 'Chat',
    field: 'id'
});

export const Chat = mongoose.model('Chat', chatSchema);
