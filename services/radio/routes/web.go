package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/models"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

func spaHandler(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateName(w, r, "index.html")
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	var session *sessions.Session
	var err error
	if session, err = store.Get(r, "user-session"); err == nil {
		session.Options.MaxAge = -1
		session.Save(r, w)
	}
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func registerUserHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	var signUpForm forms.SignUpForm
	if err = dec.Decode(&signUpForm); err != nil {
		return
	}
	if rve := forms.ValidateForm(signUpForm); rve != nil {
		w.WriteHeader(400)
		enc.Encode(rve)
		return
	}
	var user *models.User
	if user, err = models.RegisterUser(signUpForm); err != nil {
		return
	}
	enc.Encode(user)
	return
}

func loginHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	var signInForm forms.SignInForm
	if err = dec.Decode(&signInForm); err != nil {
		return
	}
	if rve := forms.ValidateForm(signInForm); rve != nil {
		w.WriteHeader(400)
		enc.Encode(rve)
		return
	}
	var user *models.User
	if user, err = models.SignInUser(signInForm); err != nil {
		return
	}
	session, err := store.Get(r, "user-session")
	session.Values["user_id"] = user.ID
	if err = session.Save(r, w); err != nil {
		return
	}
	enc.Encode(user)
	return
}

func playlistCreateHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var playlistForm forms.PlaylistForm
	if err = dec.Decode(&playlistForm); err != nil {
		return
	}
	if rve := forms.ValidateForm(playlistForm); rve != nil {
		w.WriteHeader(400)
		enc.Encode(rve)
		return
	}
	var playlist *models.Playlist
	if playlist, err = models.PlaylistCreate(user, playlistForm); err != nil {
		return
	}
	enc.Encode(playlist)
	return
}

func playlistListHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var playlists []models.Playlist
	if playlists, err = models.PlaylistList(user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(playlists)
	return
}

func playlistGETHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var dbID uint64
	vars := mux.Vars(r)
	if dbID, err = strconv.ParseUint(vars["id"], 10, 32); err != nil {
		return fmt.Errorf("Unknown error")
	}
	var playlist *models.Playlist
	if playlist, err = models.PlaylistGet(uint(dbID), user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(playlist)
	return
}

func playlistDeleteHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var dbID uint64
	vars := mux.Vars(r)
	if dbID, err = strconv.ParseUint(vars["id"], 10, 32); err != nil {
		return fmt.Errorf("Unknown error")
	}
	if err = models.PlaylistDelete(uint(dbID), user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(map[string]string{})
	return
}

func createTrackHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var playlist *models.Playlist
	var trackCreateForm forms.TrackCreateForm
	if err = dec.Decode(&trackCreateForm); err != nil {
		return
	}
	if rve := forms.ValidateForm(trackCreateForm); rve != nil {
		w.WriteHeader(400)
		enc.Encode(rve)
		return
	}
	if playlist, err = models.PlaylistGet(trackCreateForm.PlaylistID, user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	var track *models.Track
	if track, err = models.CreateTrack(playlist); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(track)
	return
}

func deleteTrackHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var trackID uint64
	vars := mux.Vars(r)
	if trackID, err = strconv.ParseUint(vars["id"], 10, 32); err != nil {
		return fmt.Errorf("Unknown error")
	}
	if err = models.DeleteTrack(uint(trackID), user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(map[string]interface{}{
		"id": trackID,
	})
	return
}

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()

	r.HandleFunc("/", spaHandler)
	r.HandleFunc("/account/", spaHandler)
	r.HandleFunc("/signup/", spaHandler)
	r.HandleFunc("/signin/", spaHandler)
	r.HandleFunc("/playlist/{id:[0-9]+}/", spaHandler)

	r.HandleFunc("/logout/", logoutHandler)

	frontendAPIRouter := r.PathPrefix("/frontend-api/").Subrouter()
	frontendAPIRouter.Use(jsonResponseMiddleware)
	frontendAPIRouter.HandleFunc("/register/", JSONHandler(registerUserHandler)).Methods("POST")
	frontendAPIRouter.HandleFunc("/login/", JSONHandler(loginHandler)).Methods("POST")

	playlistAPIRouter := frontendAPIRouter.PathPrefix("/playlist/").Subrouter()
	playlistAPIRouter.Use(authorizeUserMiddleware)
	playlistAPIRouter.HandleFunc("/", JSONHandler(playlistCreateHandler)).Methods("POST")
	playlistAPIRouter.HandleFunc("/", JSONHandler(playlistListHandler)).Methods("GET")
	playlistAPIRouter.HandleFunc("/{id}/", JSONHandler(playlistGETHandler)).Methods("GET")
	playlistAPIRouter.HandleFunc("/{id:[0-9]+}/", JSONHandler(playlistDeleteHandler)).Methods("DELETE")

	trackAPIRouter := frontendAPIRouter.PathPrefix("/track/").Subrouter()
	trackAPIRouter.Use(authorizeUserMiddleware)
	trackAPIRouter.HandleFunc("/", JSONHandler(createTrackHandler)).Methods("POST")
	trackAPIRouter.HandleFunc("/{id:[0-9]+}/", JSONHandler(deleteTrackHandler)).Methods("DELETE")
}
