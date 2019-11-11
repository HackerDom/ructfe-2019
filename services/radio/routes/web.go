package routes

import (
	"encoding/json"
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/models"
	"github.com/gorilla/mux"
)

func webHandler(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateName(w, r, "index.html")
}

func registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var signUpForm forms.SignUpForm
	decoder := json.NewDecoder(r.Body)
	encoder := json.NewEncoder(w)
	err = decoder.Decode(&signUpForm)
	if err != nil {
		w.WriteHeader(400)
		encoder.Encode(forms.Error2RadioValidationErrors(err))
		return
	}
	rve := signUpForm.Validate()
	if rve != nil {
		w.WriteHeader(400)
		encoder.Encode(rve)
		return
	}
	var user *models.User
	user, err = models.RegisterUser(signUpForm)
	if err != nil {
		w.WriteHeader(400)
		rve = forms.Error2RadioValidationErrors(err)
		encoder.Encode(rve)
		return
	}
	encoder.Encode(user)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var signInForm forms.SignInForm
	decoder := json.NewDecoder(r.Body)
	encoder := json.NewEncoder(w)
	err = decoder.Decode(&signInForm)
	if err != nil {
		w.WriteHeader(400)
		encoder.Encode(forms.Error2RadioValidationErrors(err))
		return
	}
	var user *models.User
	var rve *forms.RadioValidationErrors
	user, err = models.SignInUser(signInForm)
	if err != nil {
		w.WriteHeader(400)
		rve = forms.Error2RadioValidationErrors(err)
		encoder.Encode(rve)
		return
	}
	session, err := store.Get(r, "user-session")
	session.Values["user_id"] = user.ID
	err = session.Save(r, w)
	if err != nil {
		w.WriteHeader(400)
		rve = forms.Error2RadioValidationErrors(err)
		encoder.Encode(rve)
		return
	}
	encoder.Encode(user)
}

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()
	r.HandleFunc("/", webHandler)
	r.HandleFunc("/signup/", webHandler)
	r.HandleFunc("/signin/", webHandler)

	r.HandleFunc("/frontend-api/register/", registerUserHandler).Methods("POST")
	r.HandleFunc("/frontend-api/login/", loginHandler).Methods("POST")
}
