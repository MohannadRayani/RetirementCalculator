package config

import (
    "fmt"
    "log"
    "retirement-calc/models"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
    dsn := "host=localhost user=postgres password=mosuperuser1! dbname=retirement_calc port=5432 sslmode=disable TimeZone=UTC"
    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // AutoMigrate the User and Scenario models
    err = DB.AutoMigrate(&models.User{}, &models.Scenario{})
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }

    fmt.Println("Database connected successfully")
}