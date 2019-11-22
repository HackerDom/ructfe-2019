export class Chats {
    chatName = '';

    createChat = () => {
        return fetch('/createChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatName: this.chatName
            })
        })
            .then(r => r.json())
            .then(r => r.data);
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

    getInvite = (chatId) => {
        return fetch(`/inviteLink?chatId=${chatId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.json())
            .then(r => r.data.inviteLink);
    };

    joinChat = (chatId, inviteLink) => {
        return fetch('/joinChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId,
                inviteLink
            })
        }).then(r => r.json());
    };
}

export const chats = new Chats();
