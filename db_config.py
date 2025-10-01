import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # update if your DB has a password
        database="face_system"
    )
