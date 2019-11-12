package models

import (
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Username    string     `json:"username" gorm:"unique_index;not null;size:64"`
	Description string     `json:"description"`
	Age         int        `json:"age" gorm:"default:16"`
	Password    string     `json:"-" gorm:"unique_index;not null;size:64"`
	Playlists   []Playlist `json:"-"`
}

func RegisterUser(signUpForm forms.SignUpForm) (user *User, err error) {
	var password string
	password, err = utils.MakePassword(signUpForm.Password)
	if err != nil {
		return
	}
	user = &User{
		Username: signUpForm.Username,
		Password: password,
	}
	err = forms.ErrorArray2Error(db.Create(user).GetErrors())
	return
}

func SignInUser(signInForm forms.SignInForm) (user *User, err error) {
	user = &User{}
	err = forms.ErrorArray2Error(db.Where("username = ?", signInForm.Username).First(user).GetErrors())
	if err != nil {
		return
	}
	err = utils.ComparePassword(user.Password, signInForm.Password)
	return
}

func FindUserByID(userID uint) (user *User, err error) {
	user = &User{}
	err = forms.ErrorArray2Error(db.Find(&user, userID).GetErrors())
	return
}
