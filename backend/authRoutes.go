package routes

import (
    "retirement-calc/controllers"

    "github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
    r.POST("/api/auth/register", controllers.Register)
    r.POST("/api/auth/login", controllers.Login)
}