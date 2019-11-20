import { LOGIN_USER_SUCCESFULLY } from '../actions/login/actionTypes';

export default (initialState) => {
    const defaultState = {
        user: initialState.user
    };
    return (state = defaultState, action) => {
        switch (action.type) {
        case LOGIN_USER_SUCCESFULLY: {
            return {
                ...state,
                user: action.data
            };
        }
        default: {
            return state;
        }
        }
    };
};
