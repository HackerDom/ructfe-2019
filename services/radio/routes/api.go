package routes

import (
	"github.com/gorilla/mux"
)

func makeAPIRouter(mainRouter *mux.Router) {
	mainRouter.PathPrefix("/api/v1").Subrouter()
}
