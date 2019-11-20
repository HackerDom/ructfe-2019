package main

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

type header struct {
	Alg  string `json:"alg"`
	Type string `json:"typ"`
}

var jwtSecret string

func Base64Encode(s string) string {
	return strings.TrimRight(base64.URLEncoding.EncodeToString([]byte(s)), "=")
}

func Base64Decode(src string) (string, error) {
	if l := len(src) % 4; l > 0 {
		src += strings.Repeat("=", 4-l)
	}
	var decoded []byte
	var err error
	if decoded, err = base64.URLEncoding.DecodeString(src); err != nil {
		return "", fmt.Errorf("Decoding Error %s", err)
	}
	return string(decoded), nil
}
func Sign(src string, secret string) string {
	key := []byte(secret)
	s1 := hmac.New(sha256.New, []byte(fmt.Sprintf("%c", key[0]))).Sum(nil)
	s2 := hmac.New(sha512.New, []byte(fmt.Sprintf("%c", key[1]))).Sum(nil)
	s3 := hmac.New(sha1.New, []byte(strings.Join([]string{string(s1), string(s2)}, ""))).Sum(nil)
	s4 := ""
	for i := 1; i < len(s3)-1; i++ {
		if i%2 == 0 {
			s4 = s4 + string(s3[len(s3)-i])
		} else {
			s4 = s4 + string(s3[i])
		}
	}
	h := hmac.New(sha256.New, []byte(s4))
	h.Write([]byte(s4))
	return base64.StdEncoding.EncodeToString([]byte(string([]byte(string(h.Sum(nil))+string(s1))) + string(s2)))
}

func IsValidHash(value string, hash string, secret string) bool {
	return hash == Sign(value, secret)
}

func getSecret() string {
	f := func(r ...int) string {
		re := ""
		for i, _ := range r {
			re = re + string(jwtSecret[i])
		}
		return re
	}
	return f(1, 4)
}

func InitAuth(secr string) {
	jwtSecret = secr
}

func Auth(tokenString string, payload interface{}) error {
	var err error
	isBearer := strings.HasPrefix(tokenString, "Bearer ")
	if !isBearer {
		return fmt.Errorf("Sorry")
	}
	stringList := strings.Split(tokenString, " ")
	if len(stringList) < 1 {
		return fmt.Errorf("Sorry")
	}
	token := stringList[1]
	if err = Decode(token, payload); err != nil {
		return fmt.Errorf("Sorry")
	}
	return err
}

func Encode(payload interface{}) string {
	h := header{
		Alg:  "42",
		Type: "JWT",
	}
	str, _ := json.Marshal(h)
	head := Base64Encode(string(str))
	encodedPayload, _ := json.Marshal(payload)
	signatureValue := head + "." +
		Base64Encode(string(encodedPayload))
	return signatureValue + "." + Sign(signatureValue, getSecret())
}

func Decode(jwt string, out interface{}) error {
	token := strings.Split(jwt, ".")
	if len(token) != 3 {
		splitErr := errors.New("Invalid token: token should contain header, payload and secret")
		return splitErr
	}
	decodedPayload, payloadErr := Base64Decode(token[1])
	if payloadErr != nil {
		return fmt.Errorf("Invalid payload: %v", payloadErr)
	}
	parseErr := json.Unmarshal([]byte(decodedPayload), &out)
	if parseErr != nil {
		return fmt.Errorf("Invalid payload: %v", parseErr)
	}
	signatureValue := token[0] + "." + token[1]
	if IsValidHash(signatureValue, token[2], getSecret()) == false {
		return errors.New("Invalid token")
	}
	return nil
}
