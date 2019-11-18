import {
    FETCH_OUR_USER_SUCCESSFULLY
} from '../actions/ourUsers/actionTypes';

export default () => {
    const defaultState = {
        users: []
    };
    return (state = defaultState, action) => {
        switch (action.type) {
        case FETCH_OUR_USER_SUCCESSFULLY: {
            return {
                ...state,
                users: action.data
            };
        }
        default: {
            return state;
        }
        }
    };
};
