export class Login {
    username = '';
    password = '';

    login = () => {
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password
            })
        }).then(x => console.log(x))
            .catch(x => console.log(x));
    };
}

export const login = new Login();
