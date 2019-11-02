package webpack

import (
	"encoding/json"
	"io/ioutil"
	"path"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
)

var manifest map[string]string

func ReadManifest() (map[string]string, error) {
	var err error
	var conf *config.Config
	conf, err = config.GetConfig()
	if err != nil {
		return nil, err
	}
	manifestPath := path.Join(conf.StaticPath, "build", "manifest.json")
	var data []byte
	readedManifest := make(map[string]string)
	data, err = ioutil.ReadFile(manifestPath)
	err = json.Unmarshal(data, &readedManifest)
	return readedManifest, err
}

func GetManifest() (map[string]string, error) {
	var err error
	if manifest == nil {
		manifest, err = ReadManifest()
	}
	return manifest, err
}
