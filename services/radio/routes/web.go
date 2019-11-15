package routes

import (
	"encoding/json"
	"net/http"

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

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()

	r.HandleFunc("/", spaHandler)
	r.HandleFunc("/account/", spaHandler)
	r.HandleFunc("/signup/", spaHandler)
	r.HandleFunc("/signin/", spaHandler)

	r.HandleFunc("/playlist/{id:[0-9+]}/", spaHandler)

	r.HandleFunc("/logout/", logoutHandler)

	r.HandleFunc("/frontend-api/register/", JSONHandler(registerUserHandler)).Methods("POST")
	r.HandleFunc("/frontend-api/login/", JSONHandler(loginHandler)).Methods("POST")
}
