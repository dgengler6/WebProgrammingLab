from flask import Flask 
from flask import request
from flask import abort
import database_helper as database_helper
import secrets
import json

app = Flask(__name__)

app.debug = True 

@app.route('/') 
def hello_world():
    return 'Hello World!'

@app.route('/sign_in', methods = ['POST'])
def sign_in():
    if request.method == 'POST' :
        username=request.form['username']
        if database_helper.check_user_exists_email(username):
            if database_helper.get_password(username) == request.form['password'] :
                #Check that there is no token already stored
                new_token = secrets.token_hex(16) 
                database_helper.save_token(username,new_token)
                answer = {"success" : "True", "message" : "Sucessfully signed in !" , "data": new_token }
                return answer, 200
            else :
                answer = {"success" : "False", "message" : "Wrong username or password" , "data": "" }
                return json.dumps(answer), 200
        else:
            answer = {"success" : "False", "message" : "Wrong username or password" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

#Tested and working 
@app.route('/sign_up', methods = ['POST'])
def sign_up():
    if request.method == 'POST' :
        username=request.form['username']
        password=request.form['password']
        firstName=request.form['firstName']
        lastName=request.form['lastName']
        gender=request.form['gender']
        city=request.form['city']
        country=request.form['country']
        infos = [username,password,firstName,lastName,gender,city,country]

        #mauybe check format of username
        for i in infos :
            if i is None :
                answer = {"success" : "False", "message" : "All fields should contain data" , "data": "" }
                return json.dumps(answer), 200
        
        if len(password) < 10 :
            answer = {"success" : "False", "message" : "Password too short" , "data": "" }
            return json.dumps(answer), 200
        
        database_helper.save_user(infos)

        answer = {"success" : "True", "message" : "Sucessfully signed up !" , "data": "" }
        return json.dumps(answer), 200
        

    else:
        abort(404)

#Tested and working 
@app.route('/sign_out', methods = ['POST'])
def sign_out():
    if request.method == 'POST' :
        token = request.form['token']
        print(database_helper.get_username_from_token(token))
        if database_helper.get_username_from_token(token) is False:
            answer = {"success" : "False", "message" : "No such user logged in" , "data": "" }
            return json.dumps(answer), 200
        else: 
            if database_helper.remove_token(token):
                answer = {"success" : "True", "message" : "Sucessfully signed out !" , "data": "" }
                return json.dumps(answer), 200
            else : 
                answer = {"success" : "False", "message" : "Unable to sign out !" , "data": "" }
                return json.dumps(answer), 200

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

@app.route('/get_user_data_email', methods = ['POST'])
def get_user_data_by_email():
    if request.method == 'POST' :
        token = request.form['token']
        username = request.form['username']

        if database_helper.check_user_exists_token(token):

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
        if database_helper.check_user_exists_token(token):
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
        if database_helper.check_user_exists_token(token):
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

        if database_helper.check_user_exists_token(token):
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




            






        





if __name__ == '__main__' :
    app.run()
