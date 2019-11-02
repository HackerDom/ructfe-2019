package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/auth"
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

func usersListHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	var users []models.User
	if users, err = models.UserList(); err != nil {
		return fmt.Errorf("Unknown error")
	}
	usernames := make([]string, len(users))
	for i, u := range users {
		usernames[i] = u.Username
	}
	enc.Encode(usernames)
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
	var playlistID uint
	if playlistID, err = getUintParamFromRequestQuery("id", r); err != nil {
		return err
	}
	var playlist *models.Playlist
	if playlist, err = models.PlaylistGet(playlistID, user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(playlist)
	return
}

func playlistGETByHHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	vars := mux.Vars(r)
	h := vars["h"]
	var playlist *models.Playlist
	if playlist, err = models.PlaylistGetByH(h); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(playlist)
	return
}

func playlistDeleteHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	var playlistID uint
	if playlistID, err = getUintParamFromRequestQuery("id", r); err != nil {
		return err
	}
	if err = models.PlaylistDelete(playlistID, user); err != nil {
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
	if playlist.UserID != user.ID {
		return fmt.Errorf("Wrong User")
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
	var trackID uint
	if trackID, err = getUintParamFromRequestQuery("id", r); err != nil {
		return err
	}
	if err = models.DeleteTrack(trackID, user); err != nil {
		return fmt.Errorf("Can't delete track")
	}
	enc.Encode(map[string]interface{}{
		"id": trackID,
	})
	return
}

func getToken(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	user := getUserFromContext(r.Context())
	payload := map[string]string{"user": user.Username}
	token := auth.Encode(&payload)
	enc.Encode(map[string]string{"token": token})
	return
}

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()

	r.HandleFunc("/", spaHandler)
	r.HandleFunc("/signup/", spaHandler)
	r.HandleFunc("/signin/", spaHandler)
	r.HandleFunc("/our-users/", spaHandler)
	r.HandleFunc("/playlist/{id:[0-9]+}/", spaHandler)
	r.HandleFunc("/share/playlist/{h:\\w{64}}/", spaHandler)

	r.HandleFunc("/logout/", logoutHandler)

	frontendAPIRouter := r.PathPrefix("/frontend-api/").Subrouter()
	frontendAPIRouter.Use(jsonResponseMiddleware)
	frontendAPIRouter.HandleFunc("/register/", JSONHandler(registerUserHandler)).Methods("POST")
	frontendAPIRouter.HandleFunc("/login/", JSONHandler(loginHandler)).Methods("POST")
	frontendAPIRouter.HandleFunc("/share/playlist/{h:\\w{64}}/", JSONHandler(playlistGETByHHandler)).Methods("GET")
	frontendAPIRouter.HandleFunc("/our-users/", JSONHandler(usersListHandler)).Methods("GET")

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

	tokenAPIRouter := r.PathPrefix("/api/v1/token/").Subrouter()
	tokenAPIRouter.Use(jsonResponseMiddleware)
	tokenAPIRouter.Use(authorizeUserMiddleware)
	tokenAPIRouter.HandleFunc("/", JSONHandler(getToken)).Methods("GET")

	api := r.PathPrefix("/api/v1/").Subrouter()
	api.Use(jsonResponseMiddleware)
	api.Use(authorizeApiMiddleware)
	api.HandleFunc("/playlist/", JSONHandler(playlistCreateHandler)).Methods("POST")
	api.HandleFunc("/playlist/", JSONHandler(playlistListHandler)).Methods("GET")
	api.HandleFunc("/playlist/{id}/", JSONHandler(playlistGETHandler)).Methods("GET")
	api.HandleFunc("/playlist/{id:[0-9]+}/", JSONHandler(playlistDeleteHandler)).Methods("DELETE")
	api.HandleFunc("/track/", JSONHandler(createTrackHandler)).Methods("POST")
	api.HandleFunc("/track/{id:[0-9]+}/", JSONHandler(deleteTrackHandler)).Methods("DELETE")
}
