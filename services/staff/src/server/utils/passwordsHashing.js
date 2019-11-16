import bcrypt from 'bcrypt';

export function hashPassword (password) {
    return bcrypt.hashSync(password, 10);
}

export function matchPasswordHashes (password, hash) {
    return bcrypt.compareSync(password, hash);
}
