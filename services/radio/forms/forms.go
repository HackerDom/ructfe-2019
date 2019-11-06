package forms

import (
	"reflect"
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"gopkg.in/go-playground/validator.v9"
	en_translations "gopkg.in/go-playground/validator.v9/translations/en"
)

var (
	uni      *ut.UniversalTranslator
	validate *validator.Validate
)

type RadioValidationErrors struct {
	Errors map[string][]string `json:"errors"`
}

func validateErrors2RadioValidationErrors(s interface{}) *RadioValidationErrors {
	validate := validator.New()
	en := en.New()
	uni = ut.New(en, en)
	trans, _ := uni.GetTranslator("en")
	en_translations.RegisterDefaultTranslations(validate, trans)
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	err := validate.Struct(s)

	if err == nil {
		return nil
	}

	errors := make(map[string][]string)
	switch er := err.(type) {
	case *validator.InvalidValidationError:
		errors["__all__"] = []string{"Unknown error"}
	case validator.ValidationErrors:
		for _, e := range er {
			key := strings.ToLower(e.Field())
			errors[key] = []string{e.Translate(trans)}
		}
	default:
		errors["__all__"] = []string{"Unknown error"}
	}
	radioValidationErrors := &RadioValidationErrors{
		Errors: errors,
	}
	return radioValidationErrors
}

type SignUpForm struct {
	Username         string `json:"username" validate:"required,min=10,max=32"`
	Password         string `json:"password" validate:"required,min=6,max=64"`
	RepeatedPassword string `json:"repeated-password" validate:"required,min=6,max=64"`
}

func (t SignUpForm) Validate() *RadioValidationErrors {
	return validateErrors2RadioValidationErrors(t)
}

type SignInForm struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (t SignInForm) Validate() *RadioValidationErrors {
	return validateErrors2RadioValidationErrors(t)
}
