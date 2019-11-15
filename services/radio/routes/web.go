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
	var playlistForm forms.PlaylistForm
	if err = dec.Decode(&playlistForm); err != nil {
		return
	}
	if rve := forms.ValidateForm(playlistForm); rve != nil {
		w.WriteHeader(400)
		enc.Encode(rve)
		return
	}
	var userID uint
	var ok bool
	session, err := store.Get(r, "user-session")
	if userID, ok = session.Values["user_id"].(uint); !ok {
		return fmt.Errorf("Unknown error")
	}
	var user *models.User
	if user, err = models.FindUserByID(userID); err != nil {
		return fmt.Errorf("Unknown error")
	}
	var playlist *models.Playlist
	if playlist, err = models.PlaylistCreate(user, playlistForm); err != nil {
		return
	}
	enc.Encode(playlist)
	return
}

func playlistListHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	var userID uint
	var ok bool
	session, err := store.Get(r, "user-session")
	if userID, ok = session.Values["user_id"].(uint); !ok {
		return fmt.Errorf("Unknown error")
	}
	var user *models.User
	user, err = models.FindUserByID(userID)
	var playlists []models.Playlist
	if playlists, err = models.PlaylistList(user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(playlists)
	return
}

func playlistDeleteHandler(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) (err error) {
	var userID uint
	var ok bool
	session, err := store.Get(r, "user-session")
	if userID, ok = session.Values["user_id"].(uint); !ok {
		return fmt.Errorf("Unknown error")
	}
	var dbID uint64
	vars := mux.Vars(r)
	if dbID, err = strconv.ParseUint(vars["id"], 10, 32); err != nil {
		return fmt.Errorf("Unknown error")
	}
	var user *models.User
	user, err = models.FindUserByID(userID)
	if err = models.PlaylistDelete(uint(dbID), user); err != nil {
		return fmt.Errorf("Unknown error")
	}
	enc.Encode(map[string]string{})
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

	r.HandleFunc("/frontend-api/register/", JSONHandler(registerUserHandler)).Methods("POST")
	r.HandleFunc("/frontend-api/login/", JSONHandler(loginHandler)).Methods("POST")
	r.HandleFunc("/frontend-api/playlist/", JSONHandler(playlistCreateHandler)).Methods("POST")
	r.HandleFunc("/frontend-api/playlist/", JSONHandler(playlistListHandler)).Methods("GET")
	r.HandleFunc("/frontend-api/playlist/{id:[0-9]+}/", JSONHandler(playlistDeleteHandler)).Methods("DELETE")
}
