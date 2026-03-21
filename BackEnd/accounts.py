from hashlib import sha256 as encrypt
import database as db
import psycopg2

def register(email, password):
    encrypted_password = encrypt(password.encode()).hexdigest()
    if not check_email_exists(email):
        save_user_to_database(email, encrypted_password)
        return "Registration successful"
    else:
        return "E-Mail already exists, please login instead"

def check_email_exists(email):
    for user in get_users_from_database():
        if user['email'] == email:
            return True
        
    return False

def save_user_to_database(email, encrypted_password):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, encrypted_password))
    conn.commit()
    cursor.close()
    conn.close()

def login(email, password):
    encrypted_password = encrypt(password.encode()).hexdigest()
    if check_credentials(email, encrypted_password):
        return "Login successful"
    else:
        return "Invalid email or password" 

def check_credentials(email, encrypted_password):
    for user in get_users_from_database():
        if user['email'] == email and user['password'] == encrypted_password:
            return True
        
    return False

def get_users_from_database():
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    cursor.execute("SELECT email, password FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{'email': user[0], 'password': user[1]} for user in users]