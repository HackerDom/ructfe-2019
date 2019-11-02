import { action, observable } from 'mobx';

class Login {
    @observable password = ''
    @observable username = ''

    @action
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
    }

    @action
    changeUsername = (lastNameEvent) => {
        this.username = lastNameEvent.target.value;
    }

    @action
    changePassword = (passwordEvent) => {
        this.password = passwordEvent.target.value;
    }
}

export const login = new Login();
