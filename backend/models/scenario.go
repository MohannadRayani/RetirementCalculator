package models

import "gorm.io/gorm"

type Scenario struct {
    gorm.Model
    UserID                uint    `json:"user_id"`
    ScenarioName          string  `json:"scenarioName"`
    CurrentYear           int     `json:"currentYear"`
    CurrentAge            int     `json:"currentAge"`
    RetirementAge         int     `json:"retirementAge"`
    CurrentSalary         float64 `json:"currentSalary"`
    AnnualContribution    float64 `json:"annualContribution"`
    SalaryGrowthRate      float64 `json:"salaryGrowthRate"`
    CurrentNestEgg        float64 `json:"currentNestEgg"`
    RateOfReturnBeforeRetirement float64 `json:"rateOfReturnBeforeRetirement"`
    SpendingAtRetirement  float64 `json:"spendingAtRetirement"`
    SlowdownAge           int     `json:"slowdownAge"`
    SpendingAtSlowdown    float64 `json:"spendingAtSlowdown"`
    RateOfReturnInRetirement float64 `json:"rateOfReturnInRetirement"`
    InflationInRetirement float64 `json:"inflationInRetirement"`
    ProjectionData        string  `json:"projection_data"`
}

type UserData struct {
	Name                        string  `json:"name"`
	ScenarioName                string  `json:"scenarioName"` // will be string
	CurrentYear                 int     `json:"currentYear"`
	CurrentAge                  int     `json:"currentAge"`
	RetirementAge               int     `json:"retirementAge"`
	CurrentSalary               float64 `json:"currentSalary"`
	AnnualContribution          float64 `json:"annualContribution"`
	SalaryGrowthRate            float64 `json:"salaryGrowthRate"`
	CurrentNestEgg              float64 `json:"currentNestEgg"`
	RateOfReturnBeforeRetirement float64 `json:"rateOfReturnBeforeRetirement"`
	SpendingAtRetirement        float64 `json:"spendingAtRetirement"`
	SlowdownAge                 int     `json:"slowdownAge"`
	SpendingAtSlowdown          float64 `json:"spendingAtSlowdown"`
	RateOfReturnInRetirement    float64 `json:"rateOfReturnInRetirement"`
	InflationInRetirement       float64 `json:"inflationInRetirement"`
}

type ProjectionYear struct {
	Year    int     `json:"year"`
	Balance float64 `json:"balance"`
}

type ProjectionData struct {
	Years                 []ProjectionYear `json:"years"`
	MaxNestEgg            float64          `json:"max_nest_egg"`
	TotalRetirementDollars float64          `json:"total_retirement_dollars"`
}
