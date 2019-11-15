package utils

import (
	"errors"
	"github.com/nbutton23/zxcvbn-go"
	"golang.org/x/crypto/bcrypt"
)

func MakePassword(password string) (string, error) {
	passwordStrength := zxcvbn.PasswordStrength(password, nil)
	if passwordStrength.Score == 0 {
		return "", errors.New("Password is too weak")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	return string(hashedPassword), err
}

func ComparePassword(hashedPassword string, password string) (err error) {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
