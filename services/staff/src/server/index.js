#!/usr/bin/env nodejs

'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import { User } from './entities/userEntity';
import { UsersCollection } from './DB/collections/UsersCollection';
import { ChatsCollection } from './DB/collections/ChatCollection';
import { MessagesCollection } from './DB/collections/MessagesCollection';
import { DatabaseController } from './DatabaseController';
import path from 'path';

export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const staticPath = path.join(__dirname, '../../dist/');
app.use(express.static(staticPath));

export const databaseController = new DatabaseController();
const usersCollection = new UsersCollection();
const chatsCollection = new ChatsCollection();
const messagesCollection = new MessagesCollection();

app.get('/', function (request, response) {
    response.render('index.html', { root: path.join(__dirname, staticPath) });
});

app.post('/addUser', function (request, response) {
    // if (!validateUser(request.body.user)) {
    //     response.status(400).send(
    //         {
    //             success: false,
    //             error: 'Field user was not valid.',
    //             failedObject: request.body.user
    //         });
    // }
    const userModel = request.body.user;

    usersCollection
        .saveUser(userModel)
        .then(_ => response.json({ success: true }))
        .catch(_ => response.json({ success: false }));
});

app.post('/editUser', async function (request, response) {
    const userId = request.body.userId; // test
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

    await sendResponse(response, isSuccess, errorMessage, { });
});

app.post('/createChat', async function (request, response) {
    const userId = request.body.userId; // test

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

    await sendResponse(response, isSuccess, errorMessage, { chatId });
});

app.post('/joinChat', async function (request, response) {
    const userId = request.body.userId; // test
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

    await sendResponse(response, isSuccess, errorMessage, { chatId });
});

app.post('/sendMessage', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const messageText = request.body.messageText;
    const chatId = request.body.chatId;
    const userId = request.body.userId;

    let chat;

    if (isSuccess) {
        chat = await chatsCollection
            .findChat(chatId)
            .catch(_ => {
                isSuccess = false;
                errorMessage = `Can not find chat with id: ${chatId}.`;
            });
    }

    if (hasAccessToWriteMessages(userId, chat)) {
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

    await sendResponse(response, isSuccess, errorMessage, { });
});

app.post('/deleteMessage', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const userId = request.body.userId;
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

    await sendResponse(response, isSuccess, errorMessage, { });
});

app.post('/getMessages', async function (request, response) {
    let isSuccess = true;
    let errorMessage = '';

    const chatId = request.body.chatId;
    const userId = request.body.userId;

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
                test: messageWithMeta.text,
                ownerId: messageWithMeta.ownerId,
                isDeleted: messageWithMeta.isDeleted
            })
            ).filter(message => hasAccessToReedMessage(userId, message, isAdminOfCurrentChat));
    }

    await sendResponse(response, isSuccess, errorMessage, { messages: messages });
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

function hasAccessToWriteMessages (userId, chat) {
    return chat.usersIds.some(x => x === userId);
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

async function sendResponse (response, isSuccess, errorMessage, outputValue) {
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
