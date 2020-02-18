from flask import request
from flask import abort
from flask import send_from_directory
from WPLab import app
import WPLab.Server.database_helper as database_helper
import secrets
import json
import re

@app.route('/') 
def root():
    return send_from_directory('static','client.html')

@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()


#Decided to put POST request so the username and the password are not in the URL 
@app.route('/sign_in', methods = ['POST'])
def sign_in():
    if request.method == 'POST' :
        data=request.get_json()
        if 'username' in data and 'password' in data':
            username=data['username']
            if database_helper.check_user_exists_email(username):
                if database_helper.get_password(username) == data['password'] :

                    new_token = secrets.token_hex(16) 
                    if database_helper.check_user_logged_in_email(username):
                        database_helper.overwrite_token(username,new_token)
                    else:
                        database_helper.save_token(username,new_token)
                    answer = {"success" : "True", "message" : "Sucessfully signed in !" , "data": new_token }
                    
                else :
                    answer = {"success" : "False", "message" : "Wrong username or password" , "data": "" }
            else:
                answer = {"success" : "False", "message" : "Wrong username or password" , "data": "" }
        else: 
            answer = {"success" : "False", "message" : "Missing one or more field" , "data": "" }
        
        return json.dumps(answer), 200
    else:
        abort(404)

#Tested and working 
@app.route('/sign_up', methods = ['PUT'])
def sign_up():
    if request.method == 'PUT' :
        data = request.get_json()
        if 'username' in data and 'password' in data and 'firstName' in data and 'lastName' in data and 'gender' in data and 'city' in data and 'country' in data:
            username=data['username']
            password=data['password']
            firstName=data['firstName']
            lastName=data['lastName']
            gender=data['gender']
            city=data['city']
            country=data['country']
            infos = [username,password,firstName,lastName,gender,city,country]
            
            #mauybe check format of username
            if len(username) > 30 or len(password) > 40 or len (firstName) > 20  or len(lastName) > 20  or len(gender) >10 or len(city) > 20 or len(country) > 20 :
                answer = {"success" : "False", "message" : "One of the fields is too long" , "data": "" }
            else: 
                if re.search(r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", username):
                    if not database_helper.check_user_exists_email(username):
                        if len(password) < 10 :
                            answer = {"success" : "False", "message" : "Password too short" , "data": "" }
                        else :
                            database_helper.save_user(infos)
                            answer = {"success" : "True", "message" : "Sucessfully signed up !" , "data": "" }
                    else:
                        answer = {"success" : "False", "message" : "User already exists" , "data": "" }
                else: 
                    answer = {"success" : "False", "message" : "The username is not an email adress " , "data": "" }
        else: 
            answer = {"success" : "False", "message" : "Missing one or more field" , "data": "" }
        
        return json.dumps(answer), 200
        

    else:
        abort(404)

#Tested and working 
@app.route('/sign_out', methods = ['POST'])
def sign_out():
    if request.method == 'POST' :
        data = request.get_json()
        if 'token' in data :
            token = data['token']
            #print(database_helper.get_username_from_token(token))
            if database_helper.get_username_from_token(token) is False:
                answer = {"success" : "False", "message" : "No such user logged in" , "data": "" }
            else: 
                if database_helper.remove_token(token):
                    answer = {"success" : "True", "message" : "Sucessfully signed out !" , "data": "" }
                    
                else : 
                    answer = {"success" : "False", "message" : "Unable to sign out !" , "data": "" }
        else: 
            answer = {"success" : "False", "message" : "Missing one or more field" , "data": "" }
        return json.dumps(answer), 200
    else : 
        abort(404)

        

#Tested and working 
@app.route('/change_password', methods = ['POST'])
def change_password():
    if request.method == 'POST' :
        token = request.form['token']
        oldpwd = request.form['oldPassword']
        newpwd = request.form['newPassword']
        
        if database_helper.get_password(database_helper.get_username_from_token(token))==oldpwd:
            if len(newpwd) >=10 :
                database_helper.change_password(token,newpwd)
                answer = {"success" : "True", "message" : "Sucessfully changed password !" , "data": "" }
                return json.dumps(answer), 200
            else: 
                answer = {"success" : "False", "message" : "New password is too short" , "data": "" }
                return json.dumps(answer), 200
        else:
            answer = {"success" : "False", "message" : "Old passwords don't match" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

#Tested and working 
@app.route('/get_user_data_token', methods = ['POST'])
def get_user_data_by_token():
    if request.method == 'POST' :
        token = request.form['token']
            
        data = database_helper.get_user_data_from_token(token)
        if data is False :
            answer = {"success" : "False", "message" : "No such user logged in" , "data": "" }
            return json.dumps(answer), 200
        else : 
            answer = {"success" : "True", "message" : "Here's the data" , "data": data }
            return json.dumps(answer), 200
    else:
        abort(404)
#Change to JSON 
@app.route('/get_user_data_email', methods = ['POST'])
def get_user_data_by_email():
    if request.method == 'POST' :
        token = request.form['token']
        username = request.form['username']

        if database_helper.check_user_logged_in_token(token):

            data = database_helper.get_user_data_from_email(username)
            if data is False :
                answer = {"success" : "False", "message" : "No such user in the system" , "data": "" }
                return json.dumps(answer), 200
            else : 
                answer = {"success" : "True", "message" : "Here's the data" , "data": data }
                return json.dumps(answer), 200

        else: 
            answer = {"success" : "False", "message" : "You are not logged in anymore" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/get_user_messages_token', methods = ['POST'])
def get_user_messages_by_token():
    if request.method == 'POST' :
        token = request.form['token']
        if database_helper.check_user_logged_in_token(token):
            data = database_helper.retrieve_message_token(token)
            if data is False :
                answer = {"success" : "False", "message" : "You don't have any messages" , "data": None }
                return json.dumps(answer), 200
            else :
                answer = {"success" : "True", "message" : "Here are the messages" , "data": data }
                return json.dumps(answer), 200
        else: 
            answer = {"success" : "False", "message" : "You are not logged in anymore" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/get_user_messages_email', methods = ['POST'])
def get_user_messages_by_email():
    if request.method == 'POST' :
        token = request.form['token']
        username = request.form['username']
        if database_helper.check_user_logged_in_token(token):
            data = database_helper.retrieve_message_email(username)
            if not data :
                answer = {"success" : "False", "message" : "You don't have any messages" , "data": None }
                return json.dumps(answer), 200
            else :
                answer = {"success" : "True", "message" : "Here are the messages" , "data": data }
                return json.dumps(answer), 200
        else: 
            answer = {"success" : "False", "message" : "You are not logged in anymore" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/post_message', methods = ['POST'])
def post_message():
    if request.method == 'POST' :
        token = request.form['token']
        message = request.form['message']
        receiver = request.form['username']

        if database_helper.check_user_logged_in_token(token):
            writer = database_helper.get_username_from_token(token)
            if database_helper.post_message(receiver,writer,message):
                answer = {"success" : "True", "message" : "Sucessfully posted message " , "data": "" }
                return json.dumps(answer), 200
            else: 
                answer = {"success" : "False", "message" : "Unable to post message " , "data": "" }
                return json.dumps(answer), 200
        else: 
            answer = {"success" : "False", "message" : "You are not logged in anymore" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

