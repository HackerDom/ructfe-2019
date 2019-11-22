export class Login {
    username = '';
    password = '';
    userId = null;

    login = async () => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password
            })
        });

        this.onSuccess(await response.json());
    };

    onSuccess = (response) => {
        this.userId = response.data.userId;
    }
}

export const login = new Login();
