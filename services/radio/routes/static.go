package routes

import (
	"log"
	"net/http"

	"github.com/HackerDom/ructfe-2019/services/radio/config"

	"github.com/gorilla/mux"
)

func makeStaticRouter(mainRouter *mux.Router) {
	conf, err := config.GetConfig()
	if err != nil {
		log.Fatalf("Can't get config, reason: %v", err)
	}
	mainRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(conf.StaticPath))))
}
