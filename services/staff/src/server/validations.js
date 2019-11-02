export function validateUser (user) {
    if (typeof user !== 'object') return false;
    if (typeof user.username === 'string' &&
        typeof user.password === 'string' &&
        typeof user.biography === 'string') {
        return !(user.chatId || user.isAdmin);
    }
    return false;
}

export function fieldsAreExist (...fieldsValues) {
    let isSuccess = Boolean(fieldsValues);

    for (const fieldValue of fieldsValues) {
        if (!fieldValue) {
            isSuccess = false;
        }
    }

    return isSuccess;
}
