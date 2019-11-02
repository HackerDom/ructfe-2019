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

type RedisConfig struct {
	Host string `yaml:"host"`
	Port int    `yaml:"port"`
	DB   string `yaml:"db"`
}

type CoreConfig struct {
	SessionKey string `yaml:"-"`
	JWTSecret  string `yaml:"-"`
}

type Config struct {
	Paths PathConfig  `yaml:"paths"`
	DB    DBConfig    `yaml:"db"`
	Redis RedisConfig `yaml:"redis"`
	Core  CoreConfig  `yaml:"-"`
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
	if config.DB.Password, err = utils.ReadSecret("db_password"); err != nil {
		return config, err
	}
	if config.Core.SessionKey, err = utils.ReadSecret("session_key"); err != nil {
		return config, err
	}
	if config.Core.JWTSecret, err = utils.ReadSecret("jwt_secret"); err != nil {
		return config, err
	}
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
