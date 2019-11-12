package forms

type SignUpForm struct {
	Username         string `json:"username" validate:"required,alpha,min=2,max=32"`
	Password         string `json:"password" validate:"required,min=6,max=64"`
	RepeatedPassword string `json:"repeated_password" validate:"required,eqfield=Password"`
}

type SignInForm struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type PlaylistForm struct {
	Name        string `json:"name" validate:"required,alpha,min=1,max=256"`
	Description string `json:"description"`
}

type TrackForm struct {
	Name string `json:"name" validate:"required,alpha,min=1,max=256"`
}
