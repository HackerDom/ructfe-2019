class Search {
    firstName = '';
    lastName = '';
    id='';
    username = '';

    search = () => {
        return fetch('/searchUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    firstName: this.firstName,
                    lastName: this.lastName
                }
            })
        }).then(response => {
            return response.json().then(json => {
                if (json.success && json.data.id !== undefined) {
                    return {
                        username: json.data.username,
                        id: json.data.id
                    };
                }
            });
        }).catch(error => console.error(error));
    }
}

export const search = new Search();
