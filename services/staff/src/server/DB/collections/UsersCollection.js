import { User } from '../../entities/userEntity';
import uuid from 'uuid/v4';

export class UsersCollection {
    async saveUser (userModel) {
        const user = new User(userModel);
        user.id = uuid();
        await user.save();
        return user.id;
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

    async checkUserInDatabase (username) {
        return User.findOne({ username: username }, (err, user) => {
            if (err) {
                return null;
            } else {
                return user;
            }
        }).then(user => {
            return Boolean(user);
        });
    }

    async editUser (oldUserModel, newFields) {
        for (const key of Object.keys(newFields)) {
            if (Object.prototype.hasOwnProperty.call(oldUserModel.toObject(), key) &&
                key !== 'id' &&
                key !== '_id' &&
                key !== '__v' &&
                key !== 'username' &&
                key !== 'password') {
                oldUserModel[key] = newFields[key];
            }
        }
        return oldUserModel.save();
    }

    async addFieldsToUser (oldUserModel, newFields) {
        for (const key of Object.keys(newFields)) {
            oldUserModel[key] = newFields[key];
        }

        return oldUserModel.save();
    }

    async findByNameAndLastName (pattern) {
        return User.findOne(pattern, (err, user) => {
            if (!err) {
                if (!user) {
                    return user;
                }
                return user;
            } else {
                return null;
            }
        });
    }
}
