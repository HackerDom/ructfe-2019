package routes

import (
	"fmt"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
	"gopkg.in/boj/redistore.v1"
)

var store *redistore.RediStore

func InitSessionStore() (*redistore.RediStore, error) {
	var err error
	conf := config.GetConfig()
	redisAddr := fmt.Sprintf("%s:%d", conf.Redis.Host, conf.Redis.Port)
	store, err = redistore.NewRediStoreWithDB(10, "tcp", redisAddr, "", conf.Redis.DB, []byte(conf.Core.SessionKey))
	return store, err
}
