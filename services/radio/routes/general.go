package routes

import (
	"github.com/gorilla/mux"
)

func MakeRouter() *mux.Router {
	r := mux.NewRouter()
	makeStaticRouter(r)
	makeMusicRouter(r)
	makeWebRouter(r)
	return r
}
