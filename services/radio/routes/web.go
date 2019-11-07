package routes

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/gorilla/mux"
)

func webHandler(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateName(w, r, "index.html")
}

func registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var signupForm forms.SignUpForm
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&signupForm)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	rve := signupForm.Validate()
	if rve != nil {
		w.WriteHeader(400)
		encoder := json.NewEncoder(w)
		encoder.Encode(rve)
		return
	}
	log.Printf("register handler data %v", &signupForm)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var d map[string]string
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&d)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	log.Printf("Login handler data %v", d)
}

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()
	r.HandleFunc("/", webHandler)
	r.HandleFunc("/signup/", webHandler)
	r.HandleFunc("/signin/", webHandler)

	r.HandleFunc("/frontend-api/register/", registerUserHandler).Methods("POST")
	r.HandleFunc("/frontend-api/login/", loginHandler).Methods("POST")
}
