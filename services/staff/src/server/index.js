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
import { hashPassword, matchPasswordHashes } from './utils/passwordsHashing';

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
        const user = await usersCollection.findUserByUsername(username).catch(() => null);
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }
        if (!matchPasswordHashes(password, user.password)) {
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
    done(null, {
        username: user.username,
        id: user.id,
        biography: user.biography
    });
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

app.get('/', function (request, response) {
    console.log(staticPath);
    response.sendFile('index.html', { root: staticPath });
});
app.get('/chatsPage', function (request, response) {
    response.sendFile('index.html', { root: staticPath });
});
app.get('/auth', function (request, response) {
    response.sendFile('index.html', { root: staticPath });
});

app.get('/usersPage', function (request, response) {
    response.sendFile('index.html', { root: staticPath });
});

app.get('/search', function (request, response) {
    response.sendFile('index.html', { root: staticPath });
});

app.post('/register', async function (request, response) {
    const passwordHash = request.body.password ? await hashPassword(request.body.password.toString()) : null;

    const newUser = new User({
        username: request.body.username ? request.body.username.toString() : null,
        password: passwordHash ? passwordHash.toString() : null,
        firstName: request.body.firstName ? request.body.firstName.toString() : null,
        lastName: request.body.lastName ? request.body.lastName.toString() : null,
        biography: request.body.biography ? request.body.biography.toString() : null
    });

    const isValid = fieldsAreExist(
        newUser.username,
        newUser.password,
        newUser.firstName,
        newUser.lastName,
        newUser.biography) && newUser.username !== '' && newUser.password !== '';

    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
        return;
    }

    const userExist = await usersCollection.checkUserInDatabase(request.body.username);
    if (userExist) {
        await sendResponse(response, {}, false, 'User with this name is already exist', 400);
        return;
    }
    const userId = await usersCollection.saveUser(newUser);
    await sendResponse(response, { userId: userId });
});

app.post('/login', passport.authenticate('local'), async (request, response) => {
    await sendResponse(response, { userId: request.user.id });
});

app.get('/user', async (request, response) => {
    const userId = request.query.userId;
    let isSuccess = true;
    let errorMessage = '';
    const isValid = fieldsAreExist(userId);
    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
        return;
    }
    const user = await usersCollection.findUser(userId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not find user';
        });
    if (isSuccess) {
        await sendResponse(
            response,
            {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                biography: user.biography
            });
    } else {
        await sendResponse(
            response,
            {},
            isSuccess,
            errorMessage,
            404);
    }
});

app.post('/editUser', checkAuthentication, async function (request, response) {
    const userId = await request.user.id;
    const fields = request.body.fields;

    const isValid = Boolean(fields);
    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
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

    const isValid = chatName && fieldsAreExist(chatName.toString());

    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
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
    const inviteLink = request.body.inviteLink;

    const isValid = fieldsAreExist(chatId, inviteLink);

    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
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

    if (isSuccess && String(chat.inviteLink) !== String(inviteLink)) {
        await sendResponse(response, {}, false, 'Invalid invite link', 403);
        return;
    }

    if (isSuccess) {
        chat.usersIds.push(userId);
    }

    if (isSuccess) {
        await chatsCollection.saveChat(chat)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not save updated chat.';
            });
    }

    await sendResponse(response, { chatId }, isSuccess, errorMessage);
});

app.get('/inviteLink', checkAuthentication, async function (request, response) {
    const chatId = request.query.chatId;
    const isValid = fieldsAreExist(chatId);
    const userId = request.user.id;

    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
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

    if (isSuccess && !chat.usersIds.some(id => id === userId)) {
        await sendResponse(response, {}, false, 'You have not access to this chat', 403);
        return;
    }

    await sendResponse(response,
        {
            inviteLink: chat.inviteLink,
            chatId: chat.id
        },
        isSuccess,
        errorMessage);
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
            if (Array.isArray(x)) {
                return x;
            }
            return [x];
        }).then(x => x.map(chat => {
            return {
                id: chat.id,
                name: chat.name,
                usersIds: chat.usersIds
            };
        }));
    chats.sort((a, b) => b.id - a.id);
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
        await sendResponseOnInvalidRequestFields(response);
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

    await sendResponse(response, { messageId: messageId }, isSuccess, errorMessage);
});

app.post('/deleteMessage', checkAuthentication, async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const userId = await request.user.id;
    const messageId = request.body.messageId;
    const isValid = fieldsAreExist(messageId);
    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
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
    if (isSuccess && !hasAccessToDeleteMessage(userId, message)) {
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

app.get('/messages', checkAuthentication, async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const chatId = request.query.chatId;
    const userId = await request.user.id;

    const isValid = fieldsAreExist(chatId);
    if (!isValid) {
        await sendResponseOnInvalidRequestFields(response);
        return;
    }

    let messagesWithMeta;
    let messages;
    let user;

    const chat = await chatsCollection
        .findChat(chatId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = `Can find chat with id: ${chatId}.`;
        });

    if (isSuccess && !chat.usersIds.some(x => x === userId)) {
        await sendResponse(response, {}, false, 'You have not access to this chat', 403);
        return;
    }

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
            .getMessages(chat.messagesIds)
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

app.post('/searchUser', async function (request, response) {
    const isValid = request.body.query && fieldsAreExist(request.body.query.firstName, request.body.query.lastName);
    let isSuccess = true;
    if (!isValid) {
        await sendResponse(response, {}, false, 'Request\'s fields is not valid', 400);
        return;
    }
    const query = request.body.query;
    const foundedUser = await usersCollection
        .findByNameAndLastName({
            firstName: query.firstName,
            lastName: query.lastName
        })
        .catch(_ => {
            isSuccess = false;
        });
    if (!isSuccess) {
        await sendResponseOnInternalError(response);
        return;
    }
    const userInfo = foundedUser ? {
        username: foundedUser.username,
        firstName: foundedUser.firstName,
        lastName: foundedUser.lastName,
        biography: foundedUser.biography,
        id: foundedUser.id
    } : {};
    await sendResponse(response, userInfo);
});

app.get('/selfId', checkAuthentication, async function (request, response) {
    const userId = await request.user.id;
    await sendResponse(response, { id: userId });
});

function hasAccessToWriteMessages (userId, usersIds) {
    return usersIds.some(x => String(x) === String(userId));
}

function hasAccessToDeleteMessage (userId, message) {
    return String(message.ownerId) === String(userId);
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
            data: outputValue,
            success: true
        });
    } else {
        await response.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
}

async function sendResponseOnInvalidRequestFields (response) {
    await sendResponse(response, {}, false, 'Request\'s fields is not valid', 400);
}

async function sendResponseOnInternalError (response) {
    await sendResponse(response, {}, false, '', 500);
}

async function checkAuthentication (request, response, next) {
    if (request.isAuthenticated()) {
        next();
    } else {
        await sendResponse(
            response,
            {},
            false,
            'You have not been authorised',
            401);
    }
}
