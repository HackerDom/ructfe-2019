package forms

import (
	"errors"
	"reflect"
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	validator "gopkg.in/go-playground/validator.v9"
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

func ErrorArray2RadioValidationErrors(errs []error) *RadioValidationErrors {
	errors := make(map[string][]string)
	errorStrings := make([]string, 1)
	for _, e := range errs {
		errorStrings = append(errorStrings, e.Error())
	}
	errors["__all__"] = errorStrings
	radioValidationErrors := &RadioValidationErrors{
		Errors: errors,
	}
	return radioValidationErrors
}

func Error2RadioValidationErrors(err error) *RadioValidationErrors {
	errors := make(map[string][]string)
	errors["__all__"] = []string{err.Error()}
	radioValidationErrors := &RadioValidationErrors{
		Errors: errors,
	}
	return radioValidationErrors
}

func ErrorArray2Error(errs []error) (err error) {
	if len(errs) > 0 {
		errorStrings := make([]string, 0)
		for _, e := range errs {
			errorStrings = append(errorStrings, e.Error())
		}
		err = errors.New(strings.Join(errorStrings, ", "))
	}
	return
}

func ValidateForm(form interface{}) *RadioValidationErrors {
	return validateErrors2RadioValidationErrors(form)
}
