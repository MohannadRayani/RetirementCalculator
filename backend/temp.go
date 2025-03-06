package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	plainTextPassword := "password123"

	// Generate hash
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(plainTextPassword), bcrypt.DefaultCost)
	fmt.Println("Generated Hash:", string(hashedPassword))

	// Compare with correct password
	err := bcrypt.CompareHashAndPassword(hashedPassword, []byte(plainTextPassword))
	if err != nil {
		fmt.Println("Password Mismatch!")
	} else {
		fmt.Println("Password Matched!")
	}
}
