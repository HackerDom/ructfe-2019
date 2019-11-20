class Register {
    firstName = '';
    lastName = '';
    bio = '';
    password = '';
    username = '';

    register = () => {
        return fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.username,
                firstName: this.firstName,
                lastName: this.lastName,
                password: this.password,
                biography: this.bio
            })
        }).then(x => console.log(x))
            .catch(x => console.log(x));
    };
}

export const register = new Register();
