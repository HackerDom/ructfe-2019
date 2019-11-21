import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

autoIncrement.initialize(mongoose.connection);

const messageSchema = new mongoose.Schema({
    id: String,
    text: String,
    ownerId: String,
    isDeleted: Boolean
});

messageSchema.index({
    id: 1
}, {
    unique: true
});

messageSchema.plugin(autoIncrement.plugin, {
    model: 'Message',
    field: 'id'
});

export const Message = mongoose.model('Message', messageSchema);
