#!/usr/bin/env nodejs

'use strict';

import express from 'express';
import bodyParser from 'body-parser';

import { User } from './entities/userEntity';
// import { Chat } from './entities/chatEntity';
import { UsersCollection } from './DB/collections/UsersCollection';
import { ChatsCollection } from './DB/collections/ChatCollection';
import { DatabaseController } from './DatabaseController';
import path from 'path';

export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const staticPath = path.join(__dirname, '../../dist/');
app.use(express.static(staticPath));

export const databaseController = new DatabaseController();
const usersCollections = new UsersCollection();
const chatsCollections = new ChatsCollection();

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

    usersCollections
        .saveUser(userModel)
        .then(_ => response.json({ success: true }))
        .catch(_ => response.json({ success: false }));
});

app.post('/editUser', async function (request, response) {
    const userId = request.body.userId; // test
    const fields = request.body.fields;

    let isSuccess = true;
    let errorMessage = '';

    const oldUser = await usersCollections
        .findUser(userId)
        .catch(e => {
            isSuccess = false;
            errorMessage = 'Can not find user.';
        });

    if (isSuccess) {
        await usersCollections
            .editUser(oldUser, fields)
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not change user fields.';
            });
    }

    if (isSuccess) {
        await response.json({ success: true });
    } else {
        await response.json({
            success: false,
            error: errorMessage
        });
    }
});

app.post('/createChat', async function (request, response) {
    const userId = request.body.userId; // test

    let isSuccess = true;
    let errorMessage = '';
    let chatId;

    const user = await usersCollections
        .findUser(userId)
        .catch(e => {
            isSuccess = false;
            errorMessage = 'Can not find user.';
        });
    if (isSuccess) {
        chatId = await chatsCollections
            .createChat(userId)
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not create chat.';
            });
    }
    if (isSuccess) {
        await usersCollections
            .addFieldsToUser(user, {
                chatId: chatId,
                isAdmin: true
            })
            .catch(e => {
                isSuccess = false;
                errorMessage = 'Can not change user fields.';
            });
    }

    if (isSuccess) {
        await response.json({
            success: true,
            chatId: chatId
        });
    } else {
        await response.json({
            success: false,
            error: errorMessage
        });
    }
});

app.post('/joinChat', async function (request, response) {
    const userId = request.body.userId; // test
    const chatId = request.body.chatId;

    let isSuccess = true;
    let errorMessage = '';

    const chat = await chatsCollections
        .findChat(chatId)
        .catch(_ => {
            isSuccess = false;
            errorMessage = 'Can not find chat.';
        });
    chat.userIds.push(userId);

    if (isSuccess) {
        await chatsCollections.saveChat(chat)
            .catch(_ => {
                isSuccess = false;
                errorMessage = 'Can not save updated chat.';
            });
    }

    if (isSuccess) {
        await response.json({
            success: true,
            chatId: chatId
        });
    } else {
        await response.json({
            success: false,
            error: errorMessage
        });
    }
});

app.post('sendMessage', async function (request, response) {
    const messageText = request.body.message.text;
    const chatId = request.body.message.chatId;
    const messageId = request.body.message.messageId;


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
