class Edit {
    firstName = '';
    lastName = '';
    biography = '';

    edit = () => {
        return fetch('/editUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    biography: this.biography
                }
            })
        })
            .then(r => r.json())
            .catch(x => console.log(x));
    };
}

export const edit = new Edit();
