#!/usr/bin/env nodejs

import { User } from './entities/userEntity';
import { UsersCollection } from './DB/collections/UsersCollection';
import { ChatsCollection } from './DB/collections/ChatCollection';
import { MessagesCollection } from './DB/collections/MessagesCollection';
import { fieldsAreExist } from './validations';

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

app.post('/register', async function (request, response) {
    const newUser = new User({
        username: request.body.username ? request.body.username.toString() : null,
        password: request.body.password ? request.body.password.toString() : null,
        firstName: request.body.firstName ? request.body.firstName.toString() : null,
        lastName: request.body.lastName ? request.body.lastName : null,
        biography: request.body.biography.toString() ? request.body.biography : null
    });
    const isValid = fieldsAreExist(
        newUser.username,
        newUser.password,
        newUser.firstName,
        newUser.lastName,
        newUser.biography);

    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

    const userExist = await usersCollection.checkUserInDatabase(request.body.username);
    if (userExist) {
        await sendResponse(response, {}, false, 'User with this name is already exist', 400);
        return;
    }
    await usersCollection.saveUser(newUser);
    await sendResponse(response);
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

app.post('/editUser', checkAuthentication, async function (request, response) {
    const userId = await request.user.id;
    const fields = request.body.fields;

    const isValid = Boolean(fields);
    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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

app.post('/createChat', checkAuthentication, async function (request, response) {
    const userId = await request.user.id;
    const chatName = request.body.chatName;

    const isValid = fieldsAreExist(chatName);

    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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
            .createChat(userId, chatName)
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

app.post('/joinChat', checkAuthentication, async function (request, response) {
    const userId = await request.user.id;
    const chatId = request.body.chatId;

    const isValid = fieldsAreExist(chatId);

    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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

app.get('/chats', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const chats = await chatsCollection
        .getChats()
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not find chats.';
        }).then(x => {
            if (typeof x === 'object') {
                return [x];
            }
            return x;
        }).then(x => x.map(chat => ({ id: chat.id, name: chat.name, usersIds: chat.usersIds })));
    await sendResponse(response, { chats }, isSuccess, errorMessage);
});

app.post('/sendMessage', checkAuthentication, async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const messageText = request.body.messageText;
    const chatId = request.body.chatId;
    const userId = await request.user.id;

    const isValid = fieldsAreExist(messageText, chatId);
    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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

app.post('/deleteMessage', checkAuthentication, async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const userId = await request.user.id;
    const messageId = request.body.messageId;
    const isValid = fieldsAreExist(messageId);
    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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

app.post('/getMessages', checkAuthentication, async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const chatId = request.body.chatId;
    const userId = await request.user.id;

    const isValid = fieldsAreExist(chatId);
    if (!isValid) {
        await sendResponse(response, {}, false, 'Request fields is not valid', 400);
        return;
    }

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
    return isAdminOfCurrentChat || !message.isDeleted || String(message.ownerId) === String(userId);
}

function checkIsAdminOfCurrentChat (user, chatId) {
    return String(user.chatId) === String(chatId) && user.isAdmin;
}

async function sendResponse (response, outputValue = {}, isSuccess = true, errorMessage = '', statusCode = 200) {
    if (isSuccess) {
        await response.json({
            ...outputValue,
            success: true
        });
    } else {
        await response.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
}

async function checkAuthentication (request, response, next) {
    if (request.isAuthenticated()) {
        next();
    } else {
        await sendResponse(response, {}, false, 'Auth required', 403);
    }
}
