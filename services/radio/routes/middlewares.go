package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/jwt"
	"github.com/HackerDom/ructfe-2019/services/radio/models"
)

type ContextType string

const ContextUserKey ContextType = "user"

type JWTPayload struct {
	User string `user`
}

func jsonResponseMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func authorizeUserMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var userID uint
		var ok bool
		encoder := json.NewEncoder(w)
		session, err := store.Get(r, "user-session")
		if userID, ok = session.Values["user_id"].(uint); !ok {
			w.WriteHeader(400)
			err = fmt.Errorf("Sorry")
			encoder.Encode(forms.Error2RadioValidationErrors(err))
			return
		}
		var user *models.User
		if user, err = models.FindUserByID(userID); err != nil {
			w.WriteHeader(400)
			err = fmt.Errorf("Sorry")
			encoder.Encode(forms.Error2RadioValidationErrors(err))
			return
		}
		ctx := context.WithValue(r.Context(), ContextUserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func authorizeApiMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		encoder := json.NewEncoder(w)
		tokenString := r.Header.Get("Authorization")
		isBearer := strings.HasPrefix(tokenString, "Bearer ")
		if !isBearer {
			w.WriteHeader(400)
			encoder.Encode(forms.Error2RadioValidationErrors(fmt.Errorf("Sorry")))
			return
		}
		stringList := strings.Split(tokenString, " ")
		if len(stringList) < 1 {
			w.WriteHeader(400)
			encoder.Encode(forms.Error2RadioValidationErrors(fmt.Errorf("Sorry")))
			return
		}
		token := stringList[1]
		var payload JWTPayload
		var err error
		if err = jwt.Decode(token, "", &payload); err != nil {
			w.WriteHeader(400)
			encoder.Encode(forms.Error2RadioValidationErrors(fmt.Errorf("Sorry")))
			return
		}
		var user *models.User
		if user, err = models.FindUserByUserName(payload.User); err != nil {
			w.WriteHeader(400)
			err = fmt.Errorf("Sorry")
			encoder.Encode(forms.Error2RadioValidationErrors(err))
			return
		}
		ctx := context.WithValue(r.Context(), ContextUserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
