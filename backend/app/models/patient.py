from pydantic import BaseModel, EmailStr, Field

class PatientCreate(BaseModel):
    # Full name must be at least 3 characters
    fullName: str = Field(..., min_length=3)
    # EmailStr automatically validates the format (requires pydantic[email])
    email: EmailStr 
    # Validates that the phone number is between 10 and 15 digits
    phone: str = Field(..., min_length=10, max_length=15)
    # Ensures the password is at least 8 characters
    password: str = Field(..., min_length=8)