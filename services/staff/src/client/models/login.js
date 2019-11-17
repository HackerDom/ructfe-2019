import { action, observable } from 'mobx';

export class Login {
    @observable username = '';

    @action
    changeUsername = (username) => {
        this.username = username;
    };
}

export const login = new Login();
