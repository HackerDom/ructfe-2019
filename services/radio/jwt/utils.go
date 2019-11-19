package jwt

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"fmt"
	"strings"
)

func sign(src string, secret string) string {
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

func isValidHash(value string, hash string, secret string) bool {
	return hash == sign(value, secret)
}
