package models

import (
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Username    string `json:"username"`
	Description string `json:"description"`
	Age         string `json:"age" default:"16"`
	Password    string `json:"-"`
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
	db.Create(user)
	return
}
