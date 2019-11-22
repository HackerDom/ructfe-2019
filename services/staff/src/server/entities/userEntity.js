import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    salt: String,
    password: String,
    biography: String,
    chatId: String,
    isAdmin: Boolean,
    id: String
});

userSchema.index({
    id: 1,
    username: 1
}, {
    unique: true
});

export const User = mongoose.model('User', userSchema);
