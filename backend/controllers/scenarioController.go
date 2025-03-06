package controllers

import (
    "math/rand"
    "net/http"
    "retirement-calc/models"
    "retirement-calc/config"
    "time"
    "sort"

    "github.com/gin-gonic/gin"
)

// ProjectionDetail represents a detailed projection row.
type ProjectionDetail struct {
    Year            int     `json:"year"`
    Age             int     `json:"age"`
    StartingBalance float64 `json:"starting_balance"`
    Interest        float64 `json:"interest"`
    Salary          float64 `json:"salary"`
    Contribution    float64 `json:"contribution"`
    ActiveRet       float64 `json:"active_retirement"`
    SlowRet         float64 `json:"slow_retirement"`
    EndingBalance   float64 `json:"ending_balance"`
}
// DeleteScenario deletes a scenario by its ID.
func DeleteScenario(c *gin.Context) {
    id := c.Param("id")
    if err := config.DB.Delete(&models.Scenario{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete scenario"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Scenario deleted"})
}

func CreateScenario(c *gin.Context) { 
    var scenario models.Scenario
    if err := c.ShouldBindJSON(&scenario); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    if err := config.DB.Create(&scenario).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save scenario"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Scenario saved"})
}

func GetScenarios(c *gin.Context) { 
    var scenarios []models.Scenario
    if err := config.DB.Find(&scenarios).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch scenarios"})
        return
    }
    c.JSON(http.StatusOK, scenarios)
}

// CalculateProjections computes a detailed projection.
func CalculateProjections(c *gin.Context) {
    var userData models.UserData
    if err := c.ShouldBindJSON(&userData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Convert percentages to decimals.
    rorBefore := userData.RateOfReturnBeforeRetirement / 100.0
    rorIn := userData.RateOfReturnInRetirement / 100.0
    salaryGrowth := userData.SalaryGrowthRate / 100.0
    inflation := userData.InflationInRetirement / 100.0
    contribRate := userData.AnnualContribution / 100.0

    // To store each year's detailed projection.
    var details []ProjectionDetail

    // Initialize variables from input.
    year := userData.CurrentYear
    age := userData.CurrentAge
    currentBalance := userData.CurrentNestEgg
    currentSalary := userData.CurrentSalary

    // Accumulation phase: until retirement.
    for age < userData.RetirementAge {
        startBal := currentBalance
        interest := startBal * rorBefore
        contribution := currentSalary * contribRate
        endingBal := startBal + interest + contribution

        detail := ProjectionDetail{
            Year:            year,
            Age:             age,
            StartingBalance: startBal,
            Interest:        interest,
            Salary:          currentSalary,
            Contribution:    contribution,
            ActiveRet:       0,
            SlowRet:         0,
            EndingBalance:   endingBal,
        }
        details = append(details, detail)

        // Prepare next iteration.
        currentBalance = endingBal
        currentSalary = currentSalary * (1 + salaryGrowth)
        year++
        age++
    }

    // Decumulation phase: starting at retirement.
    // Set initial withdrawal value.
    activeWithdrawal := userData.SpendingAtRetirement
    // slowWithdrawal will be used once age reaches slowdownAge.
    var slowWithdrawal float64

    for age <= 100 && currentBalance > 0 {
        startBal := currentBalance
        interest := startBal * rorIn

        var withdrawal float64
        var activeRet, slowRet float64
        if age < userData.SlowdownAge {
            withdrawal = activeWithdrawal
            activeRet = activeWithdrawal
            slowRet = 0
        } else {
            // Use slow withdrawal
            if slowWithdrawal == 0 {
                slowWithdrawal = userData.SpendingAtSlowdown
            } else {
                slowWithdrawal = slowWithdrawal * (1 + inflation)
            }
            withdrawal = slowWithdrawal
            activeRet = 0
            slowRet = slowWithdrawal
        }

        endingBal := startBal + interest - withdrawal
        // Prevent negative balance.
        if endingBal < 0 {
            endingBal = 0
        }

        detail := ProjectionDetail{
            Year:            year,
            Age:             age,
            StartingBalance: startBal,
            Interest:        interest,
            Salary:          0,       // No salary during retirement.
            Contribution:    0,
            ActiveRet:       activeRet,
            SlowRet:         slowRet,
            EndingBalance:   endingBal,
        }
        details = append(details, detail)

        // Update values for next year.
        currentBalance = endingBal
        if age < userData.SlowdownAge {
            activeWithdrawal = activeWithdrawal * (1 + inflation)
        }
        year++
        age++
        if currentBalance <= 0 {
            break
        }
    }

    c.JSON(http.StatusOK, details)
}

// Add this type for percentile results
type MonteCarloResult struct {
    Year            int       `json:"year"`
    WorstCase      float64   `json:"worst_case"`   // 0th percentile
    Percentile25   float64   `json:"p25"`          // 25th percentile
    Median         float64   `json:"median"`        // 50th percentile
    Percentile75   float64   `json:"p75"`          // 75th percentile
    BestCase       float64   `json:"best_case"`    // 100th percentile
    AllResults     []float64 `json:"all_results"`  // All values for this year
}

func CalculateMonteCarlo(c *gin.Context) {
    var userData models.UserData
    if err := c.ShouldBindJSON(&userData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    iterations := 500
    yearlyResults := make(map[int]*MonteCarloResult)
    
    // Calculate years until age 100 (same as retirement calculator)
    startYear := userData.CurrentYear
    yearsToSimulate := 100 - userData.CurrentAge
    endYear := startYear + yearsToSimulate
    
    // Initialize map for all years until age 100
    for year := startYear; year <= endYear; year++ {
        yearlyResults[year] = &MonteCarloResult{
            Year: year,
            AllResults: make([]float64, 0, iterations),
        }
    }

    rand.Seed(time.Now().UnixNano())

    // Run simulations
    for i := 0; i < iterations; i++ {
        currentBalance := userData.CurrentNestEgg
        currentSalary := userData.CurrentSalary
        year := userData.CurrentYear
        age := userData.CurrentAge

        // Accumulation phase
        for age < userData.RetirementAge && year <= endYear {
            rorBefore := userData.RateOfReturnBeforeRetirement / 100.0
            interest := currentBalance * rorBefore
            contribution := currentSalary * (userData.AnnualContribution / 100.0)
            currentBalance += interest + contribution
            currentSalary *= (1 + userData.SalaryGrowthRate/100.0)
            
            yearlyResults[year].AllResults = append(yearlyResults[year].AllResults, currentBalance)
            
            year++
            age++
        }

        // Decumulation phase
        activeWithdrawal := userData.SpendingAtRetirement
        var slowWithdrawal float64

        // Continue until age 100 or balance depleted
        for age <= 100 && currentBalance > 0 && year <= endYear {
            rorIn := userData.RateOfReturnInRetirement / 100.0
            interest := currentBalance * rorIn
            
            // Random inflation between 4-7%
            randInflation := 0.04 + rand.Float64()*0.03

            var withdrawal float64
            if age < userData.SlowdownAge {
                withdrawal = activeWithdrawal
                activeWithdrawal *= (1 + randInflation)
            } else {
                if slowWithdrawal == 0 {
                    slowWithdrawal = userData.SpendingAtSlowdown
                }
                withdrawal = slowWithdrawal
                slowWithdrawal *= (1 + randInflation)
            }

            currentBalance = currentBalance + interest - withdrawal
            if currentBalance < 0 {
                currentBalance = 0
            }

            yearlyResults[year].AllResults = append(yearlyResults[year].AllResults, currentBalance)
            
            year++
            age++
        }

        // Fill remaining years until age 100 with final balance
        for ; age <= 100 && year <= endYear; age++ {
            yearlyResults[year].AllResults = append(yearlyResults[year].AllResults, currentBalance)
            year++
        }
    }

    // Calculate percentiles for each year
    results := make([]*MonteCarloResult, 0, len(yearlyResults))
    for _, result := range yearlyResults {
        values := result.AllResults
        sort.Float64s(values)
        n := len(values)

        if n > 0 {
            result.WorstCase = values[0]
            result.Percentile25 = values[n/4]
            result.Median = values[n/2]
            result.Percentile75 = values[(3*n)/4]
            result.BestCase = values[n-1]
        }

        results = append(results, result)
    }

    // Sort results by year
    sort.Slice(results, func(i, j int) bool {
        return results[i].Year < results[j].Year
    })

    c.JSON(http.StatusOK, gin.H{
        "iterations": iterations,
        "results": results,
        "simulation_type": "Monte Carlo with Random Inflation (4-7%)",
    })
}