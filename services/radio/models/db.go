package models

import (
	"fmt"
	"time"

	"github.com/HackerDom/ructfe-2019/services/radio/config"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

const maxConnectionLifetime = time.Hour
const maxOpenConns = 100

var db *gorm.DB

func InitDB() (*gorm.DB, error) {
	var err error
	conf := config.GetConfig()
	pgConnectionString := fmt.Sprintf(
		"host=%s user=%s dbname=%s password=%s sslmode=%s",
		conf.DB.Host,
		conf.DB.User,
		conf.DB.Database,
		conf.DB.Password,
		conf.DB.SSLMode,
	)
	db, err = gorm.Open("postgres", pgConnectionString)
	if err != nil {
		return db, err
	}
	dbInstance := db.DB()
	dbInstance.SetMaxOpenConns(maxOpenConns)
	dbInstance.SetConnMaxLifetime(maxConnectionLifetime)
	return db, err
}

func MigrateDb() {
	db.AutoMigrate(&User{})
}
