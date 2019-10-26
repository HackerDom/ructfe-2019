export function validateUser (user) {
    if (typeof user !== 'object') return false;
    if (typeof user.username === 'string' &&
        typeof user.password === 'string' &&
        typeof user.biography === 'string') {
        return !(user.chatId || user.isAdmin);
    }
    return false;
}
