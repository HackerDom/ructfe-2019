package models

import (
	"github.com/HackerDom/ructfe-2019/services/radio/forms"
	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model
	Username    string `json:"username" gorm:"unique_index;not null;size:64"`
	Description string `json:"description"`
	Age         int    `json:"age" gorm:"default:16"`
	Password    string `json:"-" gorm:"unique_index;not null;size:64"`
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
