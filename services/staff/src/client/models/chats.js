import { login } from './login';

export class Chats {
    chatName = '';

    createChat = () => {
        fetch('/createChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatName: this.chatName
            })
        }).then(x => console.log(x))
            .catch(x => console.log(x));
    };

    sendMessage = (chatId, message) => {
        return fetch('/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                messageText: message
            })
        }).then(r => r.json()).then(r => r.data);
    };

    getChats = () => {
        return fetch('/chats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.json())
            .then(r => r.data.chats);
    };

    getChatMessages = (chatId) => {
        return fetch(`/messages?chatId=${chatId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.json())
            .then(r => r.data.messages);
    };
}

export const chats = new Chats();
