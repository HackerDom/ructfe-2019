package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path"
	"strconv"
	"text/template"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/models"
	"github.com/HackerDom/ructfe-2019/services/radio/webpack"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

func makeInitialState(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	var session *sessions.Session
	var err error
	state := make(map[string]interface{})
	if session, err = store.Get(r, "user-session"); err != nil {
		return state
	}
	if userID, ok := session.Values["user_id"].(uint); ok {
		var user *models.User
		if user, err = models.FindUserByID(userID); err == nil {
			state["user"] = user
		}
	}
	return state
}

func ServeWithTemplateAndStatusCode(w http.ResponseWriter, r *http.Request, templateName string, code int) {
	var err error
	conf := config.GetConfig()
	tmplFuncs := template.FuncMap{
		"webpack_asset_path": webpack.WebpackAssetPathFunc,
		"webpack_asset":      webpack.WebpackAssetFunc,
	}

	filepath := path.Join(conf.Paths.TemplatePath, templateName)
	var tmpl *template.Template
	tmpl, err = template.New(templateName).Funcs(tmplFuncs).ParseFiles(filepath)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	initialState := makeInitialState(w, r)
	ctx := make(map[string]interface{})
	var initialStateByte []byte
	if initialStateByte, err = json.Marshal(&initialState); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Println(err)
	}
	ctx["INITIAL_STATE"] = string(initialStateByte)

	w.WriteHeader(code)

	if err := tmpl.Execute(w, ctx); err != nil {
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

func getUserFromContext(ctx context.Context) *models.User {
	return ctx.Value(ContextUserKey).(*models.User)
}

func getUintParamFromRequestQuery(param string, r *http.Request) (uint, error) {
	var r64 uint64
	var err error
	vars := mux.Vars(r)
	r64, err = strconv.ParseUint(vars[param], 10, 32)
	if err != nil {
		return 0, fmt.Errorf("Param \"%s\" is too big", param)
	}
	return uint(r64), err
}

func JSONHandler(handler func(dec *json.Decoder, enc *json.Encoder, w http.ResponseWriter, r *http.Request) error) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		encoder := json.NewEncoder(w)
		if err := handler(decoder, encoder, w, r); err != nil {
			w.WriteHeader(400)
			encoder.Encode(forms.Error2RadioValidationErrors(err))
			return
		}
	}
}
