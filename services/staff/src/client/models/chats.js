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
                userId: login.userId,
                chatName: this.chatName
            })
        }).then(x => console.log(x))
            .catch(x => console.log(x));
    };
}

export const chats = new Chats();
