import { action, observable } from 'mobx';

class Register {
    @observable firstName = '';
    @observable lastName = '';
    @observable bio = '';
    @observable password = '';

    @action
    register = () => {
        console.log(
            this.firstName,
            this.lastName,
            this.bio,
            this.password
        );
    };

    @action
    changeFirstName = (firstNameEvent) => {
        this.firstName = firstNameEvent.target.value;
    };

    @action
    changeLastName = (lastNameEvent) => {
        this.lastName = lastNameEvent.target.value;
    };

    @action
    changeBio = (bioEvent) => {
        this.bio = bioEvent.target.value;
    };

    @action
    changePassword = (passwordEvent) => {
        this.password = passwordEvent.target.value;
    };
}

export const register = new Register();
