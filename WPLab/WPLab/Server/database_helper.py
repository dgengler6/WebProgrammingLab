import sqlite3
from flask import g

def connect_db():
    return sqlite3.connect("WPLab/WPLab/Server/database.db")

def disconnect_db():
    db = getattr(g, 'db', None) 
    if db is not None:
        g.db.close() 
        g.db = None

def get_db():
    db = getattr(g, 'db', None) 
    if db is None:
        db = g.db = connect_db() 
    return db

def init():
    c = get_db()
    c.execute("drop table if exists entries")
    c.execute("create table entries (id integer primary key, name text,message text)") 
    c.commit()

def add_message(name,message): 
    c = get_db()
    c.execute("insert into entries (name,message) values (?,?)", (name,message)) 
    c.commit()

def check_user_exists_email(username): 
    c = get_db().cursor()
    c.execute("SELECT email FROM users WHERE email=?", (username,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return True
    
#Checks if the given user (trying to make a request bc token ) is logged in
def check_user_logged_in_token(token): 
    c = get_db().cursor()
    c.execute("SELECT email FROM loggedInUsers WHERE token=?", (token,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return True

def check_user_logged_in_email(username): 
    c = get_db().cursor()
    c.execute("SELECT email FROM loggedInUsers WHERE email=?", (username,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return True

def save_user(infosList):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO users VALUES (?,?,?,?,?,?,?)",(infosList[0],infosList[1],infosList[2],infosList[3],infosList[4],infosList[5],infosList[6]))
    conn.commit()

def get_password(username): 
    c = get_db().cursor()
    c.execute("SELECT password FROM users WHERE email=?", (username,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return result[0]

def get_token(username):
    c = get_db().cursor()
    c.execute("SELECT token FROM loggedInUsers WHERE email=?", (username,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return result[0]

def get_username_from_token(token):
    c = get_db().cursor()
    c.execute("SELECT email FROM loggedInUsers WHERE token=?", (token,) ) 
    result = c.fetchone()
    if result is None :
        return False
    else :
        return result[0]

def get_user_data_from_token(token):
    c = get_db().cursor()
    c.execute("SELECT email,firstName,lastName,gender,city,country FROM users WHERE email in (SELECT email FROM loggedInUsers WHERE token=?)", (token,) ) 
    resultArray = c.fetchone()
      if resultArray is None :
        return False
    else :
        result = {"email": resultArray[0], "firstName": resultArray[1], "lastName":resultArray[2], "gender":resultArray[3],"city":resultArray[4],"country":resultArray[5]}
        return result

def get_user_data_from_email(email):
    c = get_db().cursor()
    c.execute("SELECT email,firstName,lastName,gender,city,country FROM users WHERE email=?", (email,) ) 
    resultArray = c.fetchone()
    if resultArray is None :
        return False
    else :
        result = {"email": resultArray[0], "firstName": resultArray[1], "lastName":resultArray[2], "gender":resultArray[3],"city":resultArray[4],"country":resultArray[5]}
        return result

def retrieve_message_token(token):
    c = get_db().cursor()
    c.execute("SELECT receiver, writer, messages FROM messages WHERE receiver IN (SELECT email FROM loggedInUsers WHERE token=?)", (token,) ) 
    resultArray = c.fetchall()
    result = []
    for i in resultArray:
        result.append({"receiver":i[0], "writer":i[1], "content":i[2]})
    if result is None :
        return False
    else :
        return result

def retrieve_message_email(username):
    c = get_db().cursor()
    c.execute("SELECT receiver, writer, messages FROM messages WHERE receiver IN (SELECT email FROM users WHERE email=?)", (username,) ) 
    resultArray = c.fetchall()
    result = []
    for i in resultArray:
        result.append({"receiver":i[0], "writer":i[1], "content":i[2]})
    if result is None :
        return False
    else :
        return result

def post_message(r, w, m):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO messages (receiver, writer, messages) VALUES (?,?,?)", (r,w,m) ) 
    conn.commit()
    return True



def save_token(username,token):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO loggedInUsers VALUES (?,?)", (username, token) ) 
    conn.commit()
    return True

def overwrite_token(username,token):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE loggedInUsers SET token=? WHERE email=?", (token,username) ) 
    conn.commit()
    return True

def remove_token(token):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM loggedInUsers WHERE token=?", (token,) ) 
    conn.commit()
    return True


def change_password(token,newPwd):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET password=? WHERE email in (SELECT email FROM loggedInUsers WHERE token=?)", (newPwd,token) ) 
    conn.commit()
    return True




def close(): 
    get_db().close()