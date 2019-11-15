import {
    PLAYLIST_CREATE_IN_PROGRESS,
    PLAYLIST_CREATE_SUCCESSFULLY,
    PLAYLIST_CREATE_WITH_ERROR,
    PLAYLISTS_FETCH_IN_PROGRESS,
    PLAYLISTS_FETCH_SUCCESSFULLY,
    PLAYLISTS_FETCH_WITH_ERRORS,
    PLAYLIST_DELETE_WITH_ERRORS,
    PLAYLIST_DELETE_SUCCESSFULLY,
    PLAYLIST_DELETE_IN_PROGRESS
} from '../actions/playlist/actionTypes';

export default () => {
    const defaultState = {
        playlists: null,
        inProgress: false,
        errors: {}
    };
    return (state = defaultState, action) => {
        switch (action.type) {
        case PLAYLIST_CREATE_IN_PROGRESS: {
            return {
                ...state,
                inProgress: true,
            };
        }
        case PLAYLIST_CREATE_SUCCESSFULLY: {
            return {
                ...state,
                playlists: [
                    action.data,
                    ...(state.playlists || []),
                ],
                inProgress: false,
                errors: {}
            };
        }
        case PLAYLIST_CREATE_WITH_ERROR: {
            const { errors } = action.data;
            return {
                ...state,
                inProgress: false,
                errors,
            };
        }
        case PLAYLISTS_FETCH_IN_PROGRESS: {
            return state;
        }
        case PLAYLISTS_FETCH_SUCCESSFULLY: {
            return {
                ...state,
                playlists: action.data
            };
        }
        case PLAYLISTS_FETCH_WITH_ERRORS: {
            return {
                ...state,
                playlists: null
            };
        }
        case PLAYLIST_DELETE_IN_PROGRESS: {
            return state;
        }
        case PLAYLIST_DELETE_SUCCESSFULLY: {
            return {
                ...state,
                playlists: state.playlists && state.playlists.filter((p) => p.ID !== action.data.id),
            };
        }
        case PLAYLIST_DELETE_WITH_ERRORS: {
            return state;
        }
        default: {
            return state;
        }
        }
    };
};
