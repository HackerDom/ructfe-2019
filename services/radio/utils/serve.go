package utils

import (
	"log"
	"net/http"
	"path"
	"text/template"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
	"github.com/HackerDom/ructfe-2019/services/radio/webpack"
)

func ServeWithTemplateAndStatusCode(w http.ResponseWriter, r *http.Request, templateName string, code int) {
	var err error
	var conf *config.Config
	conf, err = config.GetConfig()
	if err != nil {
		log.Println(err)
		return
	}

	tmplFuncs := template.FuncMap{
		"webpack_asset_path": webpack.WebpackAssetPathFunc,
		"webpack_asset":      webpack.WebpackAssetFunc,
	}

	filepath := path.Join(conf.TemplatePath, templateName)
	var tmpl *template.Template
	tmpl, err = template.New(templateName).Funcs(tmplFuncs).ParseFiles(filepath)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.WriteHeader(code)

	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Println(err)
		return
	}
}

func ServeWithTemplateName(w http.ResponseWriter, r *http.Request, templateName string) {
	ServeWithTemplateAndStatusCode(w, r, templateName, http.StatusOK)
}

func ServeError404(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateAndStatusCode(w, r, "404.html", http.StatusNotFound)
}

func ServeError403(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateAndStatusCode(w, r, "403.html", http.StatusForbidden)
}

func ServeError500(w http.ResponseWriter, r *http.Request) {
	ServeWithTemplateAndStatusCode(w, r, "500.html", http.StatusInternalServerError)
}
