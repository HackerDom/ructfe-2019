package models

import (
	"fmt"

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
	user = &User{}
	db.Where(User{Username: signUpForm.Username}).FirstOrInit(&user)
	if user.ID != 0 {
		err = fmt.Errorf("User \"%s\" already exists", signUpForm.Username)
		return
	}
	password, err = utils.MakePassword(signUpForm.Password)
	if err != nil {
		return
	}
	user.Password = password
	err = forms.ErrorArray2Error(db.Create(user).GetErrors())
	return
}

func SignInUser(signInForm forms.SignInForm) (user *User, err error) {
	user = &User{}
	isRecordNotFound := db.Where("username = ?", signInForm.Username).First(&user).RecordNotFound()
	er := fmt.Errorf("User \"%s\" not found", signInForm.Username)
	if isRecordNotFound {
		err = er
		return
	}
	err = utils.ComparePassword(user.Password, signInForm.Password)
	if err != nil {
		err = er
		return
	}
	return
}

func FindUserByID(userID uint) (user *User, err error) {
	user = &User{}
	err = forms.ErrorArray2Error(db.Find(&user, userID).GetErrors())
	return
}

func FindUserByUserName(username string) (user *User, err error) {
	user = &User{}
	isRecordNotFound := db.Where("username = ?", username).First(&user).RecordNotFound()
	if isRecordNotFound {
		err = fmt.Errorf("User \"%s\" not found", username)
		return
	}
	return
}

func UserList() (users []User, err error) {
	err = forms.ErrorArray2Error(db.Find(&users).GetErrors())
	return
}
