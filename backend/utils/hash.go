package utils

import (
	"golang.org/x/crypto/bcrypt"
	"fmt"
)

// HashPassword hashes the given password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing password:", err)
	}
	return string(bytes), err
}

// CheckPasswordHash compares a plaintext password with a hashed password
func CheckPasswordHash(password, hash string) bool {
	// Ensure hash is treated as a string
	hashedBytes := []byte(hash)

	err := bcrypt.CompareHashAndPassword(hashedBytes, []byte(password))
	if err != nil {
		fmt.Println("Password mismatch:", err)
		return false
	}
	return true
}