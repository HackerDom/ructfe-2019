package forms

type SignUpForm struct {
	Username         string `json:"username" validate:"required,alphanum,min=2,max=32"`
	Password         string `json:"password" validate:"required,min=6,max=64"`
	RepeatedPassword string `json:"repeated_password" validate:"required,eqfield=Password"`
}

type SignInForm struct {
	Username string `json:"username" validate:"required,alphanum,min=1"`
	Password string `json:"password" validate:"required,min=1"`
}

type PlaylistForm struct {
	Name        string `json:"name" validate:"required,min=1,max=256"`
	Description string `json:"description"`
	Private     bool   `json:"is_private"`
}

type TrackCreateForm struct {
	PlaylistID uint `json:"playlist_id" validate:"required,numeric"`
}

type TrackForm struct {
	Name string `json:"name" validate:"required,alphanumunicode,min=1,max=256"`
}
