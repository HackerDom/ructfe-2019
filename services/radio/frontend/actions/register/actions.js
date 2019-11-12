import fetch from 'isomorphic-fetch';
import { push } from 'connected-react-router';

import {
    REGISTER_USER_IN_PROGRESS,
    REGISTER_USER_SUCCESFULLY,
    REGISTER_USER_WITH_ERRORS,
} from './actionTypes';

export const registerUser = ({ username, password, repeated_password }) => async (dispatch) => {
    dispatch({ type: REGISTER_USER_IN_PROGRESS });
    const response = await fetch('/frontend-api/register/', {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            repeated_password
        }),
        method: 'POST',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: REGISTER_USER_SUCCESFULLY,
            data
        });
        push('/signin/');
    } else {
        const data = await response.json();
        dispatch({
            type: REGISTER_USER_WITH_ERRORS,
            data
        });
    }
};
