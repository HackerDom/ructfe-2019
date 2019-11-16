import _ from 'lodash';
import { push } from 'connected-react-router';

import {
    PLAYLIST_CREATE_IN_PROGRESS,
    PLAYLIST_CREATE_SUCCESSFULLY,
    PLAYLIST_CREATE_WITH_ERROR,
    PLAYLISTS_FETCH_IN_PROGRESS,
    PLAYLISTS_FETCH_SUCCESSFULLY,
    PLAYLISTS_FETCH_WITH_ERRORS,
    PLAYLIST_DELETE_IN_PROGRESS,
    PLAYLIST_DELETE_SUCCESSFULLY,
    PLAYLIST_DELETE_WITH_ERRORS,
    PLAYLIST_FETCH_IN_PROGRESS,
    PLAYLIST_FETCH_WITH_ERRORS,
    PLAYLIST_FETCH_SUCCESSFULLY,
    PLAYLIST_TRACK_ADD_IN_PROGRESS,
    PLAYLIST_TRACK_ADD_SUCCESSFULLY,
    PLAYLIST_TRACK_ADD_WITH_ERRORS,
    PLAYLIST_TRACK_REMOVE_IN_PROGRESS,
    PLAYLIST_TRACK_REMOVE_SUCCESSFULLY,
    PLAYLIST_TRACK_REMOVE_WITH_ERRORS,
} from './actionTypes';

export const createPlaylist = ({ name, description, is_private }, callback) => async (dispatch) => {
    dispatch({ type: PLAYLIST_CREATE_IN_PROGRESS });
    const response = await fetch('/frontend-api/playlist/', {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            is_private,
        }),
        method: 'POST',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_CREATE_SUCCESSFULLY,
            data
        });
        if (_.isFunction(callback)) {
            callback();
        }
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_CREATE_WITH_ERROR,
            data
        });
    }
};

export const fetchPlaylists = () => async (dispatch) => {
    dispatch({ type: PLAYLISTS_FETCH_IN_PROGRESS });
    const response = await fetch('/frontend-api/playlist/', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: PLAYLISTS_FETCH_SUCCESSFULLY,
            data
        });
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLISTS_FETCH_WITH_ERRORS,
            data
        });
    }
};

export const deletePlaylist = (id) => async (dispatch, getState) => {
    dispatch({ type: PLAYLIST_DELETE_IN_PROGRESS });
    const response = await fetch(`/frontend-api/playlist/${id}/`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'DELETE',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const state = getState();
        dispatch({
            type: PLAYLIST_DELETE_SUCCESSFULLY,
            data: {
                id
            }
        });
        if (state.playlist.currentPlaylist && state.playlist.currentPlaylist.ID === id) {
            dispatch(push('/'));
        }
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_DELETE_WITH_ERRORS,
            data
        });
    }
};

export const fetchPlaylist = (id, callback) => async (dispatch) => {
    dispatch({ type: PLAYLIST_FETCH_IN_PROGRESS });
    const response = await fetch(`/frontend-api/playlist/${id}/`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_FETCH_SUCCESSFULLY,
            data
        });
        if (_.isFunction(callback)) {
            callback(data);
        }
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_FETCH_WITH_ERRORS,
            data
        });
    }
};

export const createTrack = (playlistID) => async (dispatch) => {
    dispatch({ type: PLAYLIST_TRACK_ADD_IN_PROGRESS });
    const response = await fetch('/frontend-api/track/', {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playlist_id: playlistID
        }),
        method: 'POST',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_TRACK_ADD_SUCCESSFULLY,
            data
        });
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_TRACK_ADD_WITH_ERRORS,
            data
        });
    }
};

export const deleteTrack = (id) => async (dispatch) => {
    dispatch({ type: PLAYLIST_TRACK_REMOVE_IN_PROGRESS });
    const response = await fetch(`/frontend-api/track/${id}/`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'DELETE',
        credentials: 'same-origin',
    });
    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_TRACK_REMOVE_SUCCESSFULLY,
            data
        });
    } else {
        const data = await response.json();
        dispatch({
            type: PLAYLIST_TRACK_REMOVE_WITH_ERRORS,
            data
        });
    }
};
