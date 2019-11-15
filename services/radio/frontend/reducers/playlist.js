export default () => {
    const defaultState = {
        inProgress: false,
        errors: {}
    };
    return (state = defaultState, action) => {
        switch (action.type) {
        default: {
            return state;
        }
        }
    };
};
