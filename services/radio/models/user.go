package models

import "github.com/jinzhu/gorm"

type User struct {
	gorm.Model
	Username    string `json:"username"`
	Description string `json:"description"`
	Password    string `json:"-"`
}
