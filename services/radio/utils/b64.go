package utils

import (
	"encoding/base64"
	"fmt"
	"strings"
)

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
