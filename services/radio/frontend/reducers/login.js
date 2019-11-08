import {
    LOGIN_USER_IN_PROGRESS,
    LOGIN_USER_SUCCESFULLY,
    LOGIN_USER_WITH_ERRORS,
} from '../actions/login/actionTypes';

export default () => {
    const defaultState = {
        inProgress: false,
        errors: {}
    };
    return (state = defaultState, action) => {
        switch (action.data) {
        case LOGIN_USER_IN_PROGRESS: {
            return {
                ...state,
                errors: {},
                inProgress: true
            };
        }
        case LOGIN_USER_SUCCESFULLY: {
            return {
                ...state,
                errors: {},
                inProgress: false
            };
        }
        case LOGIN_USER_WITH_ERRORS: {
            return {
                ...state,
                errors: action.data,
                inProgress: false
            };
        }
        default: {
            return state;
        }
        }
    };
};
