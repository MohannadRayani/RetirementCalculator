package controllers

import (
    "fmt"
    "net/http"
    "retirement-calc/config"
    "retirement-calc/models"
    "retirement-calc/utils"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func Register(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Check if the user already exists
    var existingUser models.User
    err := config.DB.Where("email = ?", user.Email).First(&existingUser).Error
    if err == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
        return
    } else if err != gorm.ErrRecordNotFound {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    hashedPassword, err := utils.HashPassword(user.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }
    user.Password = hashedPassword

    if err := config.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User registered"})
}

func Login(c *gin.Context) {
    var input struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    var user models.User

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    err := config.DB.Where("email = ?", input.Email).First(&user).Error
    if err != nil {
        fmt.Println("User not found or database error:", err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    fmt.Println("Stored Hash:", user.Password)
    fmt.Println("Input Password:", input.Password)

    if !utils.CheckPasswordHash(input.Password, user.Password) {
        fmt.Println("Password check failed")
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token, err := utils.GenerateJWT(user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token": token})
}

func GetUser(c *gin.Context) {
    email := c.MustGet("email").(string)
    var user models.User
    if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
        return
    }
    c.JSON(http.StatusOK, user)
}