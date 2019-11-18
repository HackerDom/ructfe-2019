package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
)

func hashFunc(src string, secret string) string {
	key := []byte(secret)
	h := hmac.New(sha256.New, key)
	h.Write([]byte(src))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// isValidHash validates a hash againt a value
func isValidHash(value string, hash string, secret string) bool {
	return hash == hashFunc(value, secret)
}
