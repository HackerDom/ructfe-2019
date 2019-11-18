package jwt

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/HackerDom/ructfe-2019/services/radio/utils"
)

type header struct {
	Alg  string `json:"alg"`
	Type string `json:"typ"`
}

func Encode(payload interface{}, secret string) string {
	h := header{
		Alg:  "42",
		Type: "JWT",
	}
	str, _ := json.Marshal(h)
	head := utils.Base64Encode(string(str))
	encodedPayload, _ := json.Marshal(payload)
	signatureValue := head + "." +
		utils.Base64Encode(string(encodedPayload))
	return signatureValue + "." + hashFunc(signatureValue, secret)
}

func Decode(jwt string, secret string, out interface{}) error {
	token := strings.Split(jwt, ".")
	if len(token) != 3 {
		splitErr := errors.New("Invalid token: token should contain header, payload and secret")
		return splitErr
	}
	decodedPayload, payloadErr := utils.Base64Decode(token[1])
	if payloadErr != nil {
		return fmt.Errorf("Invalid payload: %v", payloadErr)
	}
	parseErr := json.Unmarshal([]byte(decodedPayload), &out)
	if parseErr != nil {
		return fmt.Errorf("Invalid payload: %v", parseErr)
	}
	signatureValue := token[0] + "." + token[1]
	// verifies if the header and signature is exactly whats in
	// the signature
	if isValidHash(signatureValue, token[2], secret) == false {
		return errors.New("Invalid token")
	}
	return nil
}
