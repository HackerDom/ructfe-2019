import {
    FETCH_OUR_USER_IN_PROGRESS,
    FETCH_OUR_USER_SUCCESSFULLY,
    FETCH_OUR_USER_WITH_ERRORS
} from './actionTypes';

export const fetchOurUsers = (callback) => async (dispatch) => {
    dispatch({ type: FETCH_OUR_USER_IN_PROGRESS });
    const response = await fetch('/frontend-api/our-users/', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: FETCH_OUR_USER_SUCCESSFULLY,
            data
        });
        if (_.isFunction(callback)) {
            callback(data);
        }
    } else {
        const data = await response.json();
        dispatch({
            type: FETCH_OUR_USER_WITH_ERRORS,
            data
        });
    }
};
