package forms

type SignUpForm struct {
	Username         string `json:"username" validate:"required,alpha,min=2,max=32"`
	Password         string `json:"password" validate:"required,min=6,max=64"`
	RepeatedPassword string `json:"repeated_password" validate:"required,eqfield=Password"`
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
