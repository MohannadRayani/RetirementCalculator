package routes

import (
	"retirement-calc/controllers"
	"retirement-calc/middleware"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	r.POST("/api/auth/register", controllers.Register)
	r.POST("/api/auth/login", controllers.Login)
	r.GET("/api/user/me", middleware.AuthMiddleware(), controllers.GetUser)
}
