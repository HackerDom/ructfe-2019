package utils

import (
	"io/ioutil"
	"os"
	"path"
	"strings"
)

func getSecretPath(name string) (sPath string, err error) {
	sPath = os.Getenv("SECRET_PATH")
	if len(sPath) == 0 {
		var wdPath string
		wdPath, err = os.Getwd()
		if err != nil {
			return
		}
		sPath = path.Join(wdPath, "secrets")
	}
	sPath = path.Join(sPath, name)
	return
}

func ReadSecret(name string) (secret string, err error) {
	var sPath string
	sPath, err = getSecretPath(name)
	if err != nil {
		return
	}
	var data []byte
	data, err = ioutil.ReadFile(sPath)
	secret = strings.Trim(string(data), " ")
	return
}
