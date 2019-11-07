package config

import (
	"io/ioutil"
	"os"
	"path"

	"github.com/HackerDom/ructfe-2019/services/radio/utils"
	"gopkg.in/yaml.v2"
)

var config *Config

type PathConfig struct {
	TemplatePath string `yaml:"template_path"`
	StaticPath   string `yaml:"static_path"`
}

type DBConfig struct {
	Host     string `yaml:"host"`
	User     string `yaml:"user"`
	Database string `yaml:"database"`
	Password string `yaml:"-"`
	SSLMode  string `yaml:"ssl_mode"`
}

type Config struct {
	Paths PathConfig `yaml:"paths"`
	DB    DBConfig   `yaml:"db"`
}

func makeConfig(appPath string, configName string) (*Config, error) {
	data, err := ioutil.ReadFile(path.Join(appPath, configName))
	if err != nil {
		return config, err
	}
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return config, err
	}
	config.Paths.TemplatePath = path.Join(appPath, config.Paths.TemplatePath)
	config.Paths.StaticPath = path.Join(appPath, config.Paths.StaticPath)
	config.DB.Password, err = utils.ReadSecret("db_password")
	return config, err
}

func GetConfig() *Config {
	return config
}

func InitConfig(configName string) (*Config, error) {
	var err error
	if config == nil {
		var applicationPath string
		applicationPath, err = os.Getwd()
		config, err = makeConfig(applicationPath, configName)
	}
	return config, err
}
