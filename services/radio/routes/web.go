package routes

import (
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/gorilla/mux"
)

func webHandler(w http.ResponseWriter, r *http.Request) {
	utils.ServeWithTemplate(w, r, "index.html")
}

func makeWebRouter(mainRouter *mux.Router) {
	r := mainRouter.PathPrefix("").Subrouter()
	r.HandleFunc("/", webHandler)
}
