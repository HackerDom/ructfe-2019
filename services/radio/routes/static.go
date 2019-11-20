package routes

import (
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/config"

	"github.com/gorilla/mux"
)

func makeStaticRouter(mainRouter *mux.Router) {
	conf := config.GetConfig()
	mainRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(conf.Paths.StaticPath))))
}
