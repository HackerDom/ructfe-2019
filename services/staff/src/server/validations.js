export function fieldsAreExist (...fieldsValues) {
    let isSuccess = Boolean(fieldsValues);

    for (const fieldValue of fieldsValues) {
        if (!String(fieldValue)) {
            isSuccess = false;
        }
    }

    return isSuccess;
}
