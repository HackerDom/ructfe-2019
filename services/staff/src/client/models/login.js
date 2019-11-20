export class Login {
    username = '';
    password = '';
    userId = null;

    login = () => {
        return fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password
            })
        })
            .then(r => r.json())
            .then(this.onSuccess)
            .catch(x => console.log(x));
    };

    onSuccess = (response) => {
        this.userId = response.data.userId;
    }
}

export const login = new Login();
