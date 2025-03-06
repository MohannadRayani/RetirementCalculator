package routes

import (
	"retirement-calc/controllers"

	"github.com/gin-gonic/gin"
)

func ScenarioRoutes(r *gin.Engine) {
    r.POST("/api/scenarios", controllers.CreateScenario)
    r.GET("/api/scenarios", controllers.GetScenarios)
    r.POST("/api/calculate", controllers.CalculateProjections)
    r.DELETE("/api/scenarios/:id", controllers.DeleteScenario)
    r.POST("/api/montecarlo", controllers.CalculateMonteCarlo)
}
