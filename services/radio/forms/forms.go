package forms

import (
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
	en := en.New()
	uni = ut.New(en, en)

	var trans ut.Translator
	trans, _ = uni.GetTranslator("en")
	validate := validator.New()
	en_translations.RegisterDefaultTranslations(validate, trans)
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
	Username  string `json:"username" validate:"required,min=10,max=32"`
	Password1 string `json:"password1" validate:"required,min=6,max=64"`
	Password2 string `json:"password2" validate:"required,min=6,max=64"`
}

func (t SignUpForm) Validate() *RadioValidationErrors {
	return validateErrors2RadioValidationErrors(t)
}
