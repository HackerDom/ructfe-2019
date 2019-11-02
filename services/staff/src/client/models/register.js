import { action, observable } from 'mobx';

class Register {
    @observable firstName = ''
    @observable lastName = ''
    @observable bio = ''
    @observable password = ''
    @observable username = ''

    @action
    register = () => {
        fetch('/register', {
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
    }

    @action
    changeFirstName = (firstNameEvent) => {
        this.firstName = firstNameEvent.target.value;
    }

    @action
    changeLastName = (lastNameEvent) => {
        this.lastName = lastNameEvent.target.value;
    }

    @action
    changeUsername = (lastNameEvent) => {
        this.username = lastNameEvent.target.value;
    }

    @action
    changeBio = (bioEvent) => {
        this.bio = bioEvent.target.value;
    }

    @action
    changePassword = (passwordEvent) => {
        this.password = passwordEvent.target.value;
    }
}

export const register = new Register();
