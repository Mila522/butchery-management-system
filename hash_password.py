from app.core.security import get_password_hash

password = "temporary_password"

print(get_password_hash(password))