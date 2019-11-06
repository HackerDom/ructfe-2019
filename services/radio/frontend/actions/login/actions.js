import fetch from 'isomorphic-fetch';

import {
    LOGIN_USER_IN_PROGRESS,
    LOGIN_USER_SUCCESFULLY,
    LOGIN_USER_WITH_ERRORS,
} from './actionTypes';

export const loginUser = ({ username, password }) => async (dispatch) => {
    dispatch({ type: LOGIN_USER_IN_PROGRESS });
    const response = await fetch('/frontend-api/login/', {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
        }),
        method: 'POST',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: LOGIN_USER_SUCCESFULLY,
            data
        });
    } else {
        const data = await response.json();
        dispatch({
            type: LOGIN_USER_WITH_ERRORS,
            data
        });
    }
};
