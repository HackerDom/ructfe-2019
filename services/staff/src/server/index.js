#!/usr/bin/env nodejs

'use strict';

import { User } from './entities/userEntity';
import { UsersCollection } from './DB/collections/UsersCollection';
import { ChatsCollection } from './DB/collections/ChatCollection';
import { MessagesCollection } from './DB/collections/MessagesCollection';

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import uuid from 'uuid/v4';
import passport from 'passport';
import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);

const sessionsSecretKey = uuid();
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const databaseName = 'staff-db';
const mongoUrl = `mongodb://${mongoHost}:${mongoPort}/${databaseName}`;
startMongoDb(mongoUrl);
const usersCollection = new UsersCollection();
const chatsCollection = new ChatsCollection();
const messagesCollection = new MessagesCollection();

passport.use(new LocalStrategy(
    async function (username, password, done) {
        const user = await usersCollection.findUserByUsername(username);
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }
        if (user.password !== password) {
            return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await usersCollection.findUser(id);
    done(null, { username: user.username, id: user.id, biography: user.biography });
});

export const app = express();
const staticPath = path.join(__dirname, '../../dist/');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(staticPath));
app.use(session({
    store: new MongoStore({
        url: mongoUrl
    }),
    secret: sessionsSecretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(passport.initialize());
app.use(passport.session(sessionsSecretKey));
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).end('Internal server error.');
});

export function startMongoDb (mongoUrl) {
    const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true
    };

    mongoose.connect(mongoUrl, mongooseOptions)
        .then(_ => console.log(`Mongo db listening on port ${mongoPort}.`))
        .catch(e => console.log(`Failed to start Mongo db.\n${e}`));
}

app.post('/register', async function (req, res) {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        biography: req.body.biography
    });
    const user = await usersCollection.saveUser(newUser);
    await res.json({ isSuccess: true });
});

app.post('/login', passport.authenticate('local'), async (request, response) => {
    await sendResponse(response);
});

app.get('/user', async (request, response) => {
    const user = request.user;
    await sendResponse(response, user, Boolean(user), 'Can not find user');
});

app.get('/', function (request, response) {
    response.render('index.html', { root: path.join(__dirname, staticPath) });
});

app.post('/editUser', async function (request, response) {
    const userId = await request.user.id;
    const fields = request.body.fields;

    let isSuccess = true;
    let errorMessage = '';

    const oldUser = await usersCollection
        .findUser(userId)
        .catch(e => {
            isSuccess = false;
            errorMessage = 'Can not find user.';
        });

    if (isSuccess) {
        await usersCollection
            .editUser(oldUser, fields)
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not change user fields.';
            });
    }

    await sendResponse(response, {}, isSuccess, errorMessage);
});

app.post('/createChat', async function (request, response) {
    const userId = await request.user.id;

    let isSuccess = true;
    let errorMessage = '';
    let chatId;

    const user = await usersCollection
        .findUser(userId)
        .catch(e => {
            isSuccess = false;
            errorMessage = 'Can not find user.';
        });
    if (isSuccess) {
        chatId = await chatsCollection
            .createChat(userId)
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not create chat.';
            });
    }
    if (isSuccess) {
        await usersCollection
            .addFieldsToUser(user, {
                chatId: chatId,
                isAdmin: true
            })
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not change user fields.';
            });
    }

    await sendResponse(response, { chatId }, isSuccess, errorMessage);
});

app.post('/joinChat', async function (request, response) {
    const userId = await request.user.id;
    const chatId = request.body.chatId;

    let isSuccess = true;
    let errorMessage = '';

    const chat = await chatsCollection
        .findChat(chatId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not find chat.';
        });
    chat.usersIds.push(userId);

    if (isSuccess) {
        await chatsCollection.saveChat(chat)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not save updated chat.';
            });
    }

    await sendResponse(response, { chatId }, isSuccess, errorMessage);
});

app.post('/sendMessage', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const messageText = request.body.messageText;
    const chatId = request.body.chatId;
    const userId = await request.user.id;

    let chat;

    if (isSuccess) {
        chat = await chatsCollection
            .findChat(chatId)
            .catch(_ => {
                isSuccess = false;
                errorMessage = `Can not find chat with id: ${chatId}.`;
            });
    }
    if (!hasAccessToWriteMessages(userId, chat.usersIds)) {
        isSuccess = false;
        errorMessage = 'You can not send messages in this chat.';
    }

    const messageId = await messagesCollection
        .createMessage(userId, messageText)
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not create message.';
        });

    if (isSuccess) {
        chat.messagesIds.push(messageId);
        await chatsCollection
            .saveChat(chat)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not save chat.';
            });
    }

    await sendResponse(response, {}, isSuccess, errorMessage);
});

app.post('/deleteMessage', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const userId = await request.user.id;
    const messageId = request.body.messageId;

    const message = await messagesCollection
        .getMessage(messageId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not find message.';
        });

    if (isSuccess) {
        message.isDeleted = true;
    }
    if (isSuccess && hasAccessToDeleteMessage(userId, message)) {
        isSuccess = false;
        errorMessage = 'Can not delete message of another user';
    }

    if (isSuccess) {
        await messagesCollection
            .saveMessage(message)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not save message.';
            });
    }

    await sendResponse(response, {}, isSuccess, errorMessage);
});

app.post('/getMessages', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const chatId = request.body.chatId;
    const userId = await request.user.id;

    let messagesWithMeta;
    let messages;
    let user;

    const { messagesIds } = await chatsCollection
        .findChat(chatId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = `Can find chat with id: ${chatId}.`;
        });
    if (isSuccess) {
        user = await usersCollection
            .findUser(userId)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not find user.';
            });
    }
    if (isSuccess) {
        messagesWithMeta = await messagesCollection
            .getMessages(messagesIds)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not read messages by ids.';
            });
    }

    const isAdminOfCurrentChat = checkIsAdminOfCurrentChat(user, chatId);

    if (isSuccess) {
        messages = messagesWithMeta
            .map(messageWithMeta => ({
                id: messageWithMeta.id,
                text: messageWithMeta.text,
                ownerId: messageWithMeta.ownerId,
                isDeleted: messageWithMeta.isDeleted
            })
            ).filter(message => hasAccessToReedMessage(userId, message, isAdminOfCurrentChat));
    }

    await sendResponse(response, { messages: messages }, isSuccess, errorMessage);
});

app.post('/searchUser', function (request, response) {
    const query = request.body.query;
    User.findOne(query, (err, user) => {
        if (!err) {
            if (user) {
                response.json({
                    success: true,
                    user: user
                });
            } else {
                response.json({ success: false });
            }
        } else {
            throw err;
        }
    }).exec().then(x => response.send({ ser: x }));
});

function hasAccessToWriteMessages (userId, usersIds) {
    return usersIds.some(x => String(x) === String(userId));
}

function hasAccessToDeleteMessage (userId, message) {
    return message.ownerId === userId;
}

function hasAccessToReedMessage (userId, message, isAdminOfCurrentChat) {
    return isAdminOfCurrentChat || !message.isDeleted || message.ownerId === userId;
}

function checkIsAdminOfCurrentChat (user, chatId) {
    return user.chatId === chatId && user.isAdmin;
}

async function sendResponse (response, outputValue = {}, isSuccess = true, errorMessage = '') {
    if (isSuccess) {
        await response.json({
            ...outputValue,
            success: true
        });
    } else {
        await response.json({
            success: false,
            error: errorMessage
        });
    }
}
