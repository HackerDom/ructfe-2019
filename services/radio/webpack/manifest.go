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
	conf := config.GetConfig()
	manifestPath := path.Join(conf.Paths.StaticPath, "build", "manifest.json")
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
