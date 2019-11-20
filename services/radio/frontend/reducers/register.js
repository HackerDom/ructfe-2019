import {
    REGISTER_USER_IN_PROGRESS,
    REGISTER_USER_SUCCESFULLY,
    REGISTER_USER_WITH_ERRORS
} from '../actions/register/actionTypes';

export default () => {
    const defaultState = {
        inProgress: false,
        errors: {}
    };
    return (state = defaultState, action) => {
        switch (action.type) {
        case REGISTER_USER_IN_PROGRESS: {
            return {
                ...state,
                errors: {},
                inProgress: true
            };
        }
        case REGISTER_USER_SUCCESFULLY: {
            return {
                ...state,
                errors: {},
                inProgress: false
            };
        }
        case REGISTER_USER_WITH_ERRORS: {
            const { errors } = action.data;
            return {
                ...state,
                errors,
                inProgress: false
            };
        }
        default: {
            return state;
        }
        }
    };
};
