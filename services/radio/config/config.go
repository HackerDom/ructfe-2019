package config

import (
	"os"
	"path"
)

var config *Config

type Config struct {
	TemplatePath string
	StaticPath   string
}

func makeConfig(appPath string) *Config {
	c := &Config{
		TemplatePath: path.Join(appPath, "views"),
		StaticPath:   path.Join(appPath, "static"),
	}
	return c
}

func GetConfig() (*Config, error) {
	var err error
	if config == nil {
		var applicationPath string
		applicationPath, err = os.Getwd()
		config = makeConfig(applicationPath)
	}
	return config, err
}
