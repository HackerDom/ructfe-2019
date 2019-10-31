import { User } from '../../entities/userEntity';

export class UsersCollection {
    async saveUser (userModel) {
        const user = new User(userModel);
        return user.save();
    }

    async findUser (userId) {
        return User.findOne({ id: userId }, (err, user) => {
            if (err) {
                return null;
            } else {
                return user;
            }
        }).then(user => {
            if (!user) {
                throw new Error('Can not find user in mongo db');
            } else {
                return user;
            }
        });
    }

    async findUserByUsername (username) {
        return User.findOne({ username: username }, (err, user) => {
            if (err) {
                return null;
            } else {
                return user;
            }
        }).then(user => {
            if (!user) {
                throw new Error('Can not find user in mongo db');
            } else {
                return user;
            }
        });
    }

    async editUser (oldUserModel, newFields) {
        for (const key in newFields) {
            if (oldUserModel[key]) {
                oldUserModel[key] = newFields[key];
            }
        }

        return oldUserModel.save();
    }

    async addFieldsToUser (oldUserModel, newFields) {
        for (const key in newFields) {
            oldUserModel[key] = newFields[key];
        }

        return oldUserModel.save();
    }
}
