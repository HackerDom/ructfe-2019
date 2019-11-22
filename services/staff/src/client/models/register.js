class Register {
    firstName = '';
    lastName = '';
    bio = '';
    password = '';
    username = '';

    register = async () => {
        await fetch('/register', {
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
        });
    };
}

export const register = new Register();
