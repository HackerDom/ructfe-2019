import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

autoIncrement.initialize(mongoose.connection);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    biography: String,
    chatId: String,
    isAdmin: Boolean
});

userSchema.index({
    id: 1,
    login: 1
}, {
    unique: true
});

userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id'
});

export const User = mongoose.model('User', userSchema);
