from flask import request
from flask import abort
from flask import send_from_directory
from WPLab import app
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import WPLab.Server.database_helper as database_helper
import secrets
import json
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from string import Template
from datetime import datetime



@app.route('/')
def root():
    return send_from_directory('static','client.html')

@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()

#Keep a list of users connected 
active_web_socket_connections = dict()

@app.route('/connect')
def connect():
    if request.environ.get('wsgi.websocket'):
        ws= request.environ['wsgi.websocket']

        
        #Might use True if there is any socket problem, but there shouldn't be now yeet 
        while not ws.closed:
            js_answer = ws.receive()
            if js_answer is not None :
                msg = json.loads(js_answer)
            else : 
                msg={}

            if 'username' in msg and 'token' in msg: 
                username = msg['username']
                token = msg['token']
                #Check if user already connected
                if database_helper.check_user_logged_in_email(username) :
                    #If logged in, check if a websocket is already registered for this user 
                    if username in active_web_socket_connections :
                        if active_web_socket_connections[username]['token'] == token: 
                            active_web_socket_connections[username] = {"web_socket": ws, "token" : token}
                            ws.send(json.dumps({"success" : True, "message" : "Already established WS" , "logout": False }))
                        else : 
                            active_web_socket_connections[username]['web_socket'].send(json.dumps({"success" : False, "message" : "Logging Out" , "logout": True }))
                            active_web_socket_connections[username]['web_socket'].close()
                            active_web_socket_connections[username] = {"web_socket": ws, "token" : token}
                            ws.send(json.dumps({"success" : True, "message" : "Established WS connection, logged out other instances" , "logout": False }))
                    else :
                        active_web_socket_connections[username] = {"web_socket": ws, "token" : token}
                        ws.send(json.dumps({"success" : True, "message" : "Established new WS connection" , "logout": False }))
                    notify_socket_online()
                    notify_socket_message(username)
                    notify_socket_visit(username)
                else :
                    ws.send(json.dumps({"success" : False, "message" : "Not logged in" , "logout": True }))
    return ""

def notify_socket_online():
    total_users = database_helper.get_total_number_users()
    for user in active_web_socket_connections :
        active_web_socket_connections[user]['web_socket'].send(json.dumps({"success" : True, "message" : "UpdatedConnectionData" , "statistics": True, "table" : "NUMBER_LOGGED_IN" , "data" : {"TotalUsers": total_users, "TotalOnline": len(active_web_socket_connections)} }))

def notify_socket_message(username):
    messages_on_your_wall = database_helper.retrieve_message_email(username)
    messages_you_contributed = database_helper.retrieve_posted_message_email(username)
    total_messages = database_helper.count_all_messages()
    for user in active_web_socket_connections :
        if user == username :
            active_web_socket_connections[user]['web_socket'].send(json.dumps({"success" : True, "message" : "UpdatedUserMessageData" , "statistics": True, "table" : "USER_MESSAGE_STAT" , "data" : {"MsgOnYourWall": len(messages_on_your_wall), "TotalContributed": len(messages_you_contributed),"TotalMessages":total_messages} }))
        active_web_socket_connections[user]['web_socket'].send(json.dumps({"success" : True, "message" : "UpdatedGlobalMessageData" , "statistics": True, "table" : "GLOBAL_MESSAGE_STAT" , "data" :total_messages }))

def notify_socket_visit(username):
    day = datetime.now().strftime("%w")
    visit_array = database_helper.get_profile_visits_user(username)
    for user in active_web_socket_connections :
        if user == username :
            active_web_socket_connections[user]['web_socket'].send(json.dumps({"success" : True, "message" : "UpdatedProfileVisitData" , "statistics": True, "table" : "PROFILE_VISIT_STAT" , "data" : {"list": visit_array, "day":day } }))
      


#Decided to put POST request so the username and the password are not in the URL 
@app.route('/sign_in', methods = ['POST'])
def sign_in():
    if request.method == 'POST' :
        data=request.get_json()
        if 'username' in data and 'password' in data:
            username=data['username']
            if database_helper.check_user_exists_email(username):
                if database_helper.get_password(username) == data['password'] :

                    new_token = secrets.token_hex(16)
                    if database_helper.check_user_logged_in_email(username):
                        database_helper.overwrite_token(username,new_token)
                    else:
                        database_helper.save_token(username,new_token)
                    answer = {"success" : True, "message" : "Sucessfully signed in !" , "data": new_token }

                else :
                    answer = {"success" : False, "message" : "Wrong username or password" , "data": "" }
            else:
                answer = {"success" : False, "message" : "Wrong username or password" , "data": "" }
        else:
            answer = {"success" : False, "message" : "Missing one or more field" , "data": "" }

        return json.dumps(answer), 200
    else:
        abort(404)



#Tested and working 
@app.route('/sign_up', methods = ['POST'])
def sign_up():
    if request.method == 'POST' :
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
            
            #maybe check format of username
            if len(username) > 30 or len(password) > 40 or len (firstName) > 20  or len(lastName) > 20  or len(gender) >10 or len(city) > 20 or len(country) > 20 :
                answer = {"success" : False, "message" : "One of the fields is too long" , "data": "" }
            else:
                if re.search(r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", username):
                    if not database_helper.check_user_exists_email(username):
                        if len(password) < 10 :
                            answer = {"success" : False, "message" : "Password too short" , "data": "" }
                        else :
                            database_helper.save_user(infos)
                            database_helper.set_profile_visits_user(username)
                            answer = {"success" : True, "message" : "Sucessfully signed up !" , "data": "" }
                    else:
                        answer = {"success" : False, "message" : "User already exists" , "data": "" }
                else:
                    answer = {"success" : False, "message" : "The username is not an email adress " , "data": "" }
        else:
            answer = {"success" : False, "message" : "Missing one or more field" , "data": "" }
        return json.dumps(answer), 200


    else:
        abort(404)

#Tested and working
@app.route('/sign_out', methods = ['POST'])
def sign_out():
    if request.method == 'POST' :
        headers = request.headers
        if 'token' in headers :
            token = headers['token']
            #print(database_helper.get_username_from_token(token))
            if database_helper.check_user_logged_in_token(token) is False:
                answer = {"success" : False, "message" : "No such user logged in" , "data": "" }
            else:
                user = database_helper.get_username_from_token(token)
                if database_helper.remove_token(token):
                    answer = {"success" : True, "message" : "Sucessfully signed out !" , "data": "" }
                    
                    current_ws = active_web_socket_connections[user]
                    del active_web_socket_connections[user]
                    current_ws['web_socket'].close()
                    notify_socket_online()
                else : 
                    answer = {"success" : False, "message" : "Unable to sign out !" , "data": "" }
        else:
            answer = {"success" : False, "message" : "Missing one or more field" , "data": "" }
        return json.dumps(answer), 200
    else :
        abort(404)



#Tested and working
@app.route('/change_password', methods = ['POST'])
def change_password():
    if request.method == 'POST' :
        data = request.get_json()
        headers= request.headers
        if 'token' in headers and 'oldPassword' in data and 'newPassword' in data:
            token = headers['token']
            oldpwd = data['oldPassword']
            newpwd = data['newPassword']
            username = database_helper.get_username_from_token(token)
            if username is not False :
                if database_helper.get_password(username)==oldpwd:
                    if len(newpwd) >=10 :
                        if database_helper.change_password(token,newpwd) :
                            answer = {"success" : True, "message" : "Sucessfully changed password !" , "data": "" }
                        else:
                            answer = {"success" : False, "message" : "Unable to change password" , "data": "" }
                    else: 
                        answer = {"success" : False, "message" : "New password is too short" , "data": "" }
                else:
                    answer = {"success" : False, "message" : "Old passwords don't match" , "data": "" }
            else:
                answer = {"success" : False, "message" : "You are not logged in" , "data": "" }
        else: 
            answer = {"success" : False, "message" : "Missing one or more field" , "data": "" }
        return json.dumps(answer), 200
    else:
        abort(404)


@app.route('/get_user_data_token', methods = ['GET'])
def get_user_data_by_token():
    if request.method == 'GET' :
        headers = request.headers
        if 'token' in headers :
            token = headers['token']
            data = database_helper.get_user_data_from_token(token)
            if data is False :
                answer = {"success" : False, "message" : "No such user logged in" , "data": "" }
            else : 
                answer = {"success" : True, "message" : "Retreiving data from server " , "data": data }
        else :
            answer = {"success" : False, "message" : "Missing one or more field" , "data": "" }
        return json.dumps(answer), 200
    else:
        abort(404)


@app.route('/get_user_data_email/<username>', methods = ['GET'])
def get_user_data_by_email(username):
    if request.method == 'GET' :
        headers = request.headers
        if 'token' in headers:
            token = headers['token']
            if database_helper.check_user_logged_in_token(token):
                if re.search(r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", username):
                    data = database_helper.get_user_data_from_email(username)
                    if data is False :
                        answer = {"success" : False, "message" : "No such user in the system" , "data": "" }
                    else :
                        answer = {"success" : True, "message" : "Here's the data" , "data": data }
                        day = datetime.now().strftime("%w")
                        database_helper.update_visit_profile(username, day)
                        notify_socket_visit(username)
                else:
                    answer = {"success" : False, "message" : "The username is not an email adress " , "data": "" }
            else:
                answer = {"success" : False, "message" : "You are not logged in anymore" , "data": "" }
        else:
            answer = {"success" : False, "message" : "Username or token missing from data" , "data": "" }
        return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/get_user_messages_token', methods = ['GET'])
def get_user_messages_by_token():
    if request.method == 'GET' :
        headers=request.headers
        if 'token' in headers:
            token=headers['token']
            if database_helper.check_user_logged_in_token(token):
                data = database_helper.retrieve_message_token(token)
                if data is False :
                    answer = {"success" : False, "message" : "You don't have any messages" , "data": None }
                    return json.dumps(answer), 200
                else :
                    answer = {"success" : True, "message" : "Here are the messages" , "data": data }
                    return json.dumps(answer), 200
            else:
                answer = {"success" : False, "message" : "You are not logged in anymore" , "data": "" }
                return json.dumps(answer), 200
        else:
            answer = {"success" : False, "message" : "No token in data" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/get_user_messages_email/<username>', methods = ['GET'])
def get_user_messages_by_email(username):
    if request.method == 'GET' :
        headers = request.headers
        if 'token' in headers:
            token = headers['token']
            if database_helper.check_user_logged_in_token(token):
                if re.search(r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", username):
                    if database_helper.check_user_exists_email(username):
                        data = database_helper.retrieve_message_email(username)
                        if not data :
                            answer = {"success" : False, "message" : "You don't have any messages" , "data": None }
                        else :
                            answer = {"success" : True, "message" : "Here are the messages" , "data": data }
                    else: 
                        answer = {"success" : False, "message" : "No such user in the system" , "data": "" }
                else:
                    answer = {"success" : False, "message" : "The username is not an email adress " , "data": "" }
            else:
                answer = {"success" : False, "message" : "You are not logged in anymore" , "data": "" }
            return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/post_message', methods = ['POST'])
def post_message():
    if request.method == 'POST' :
        data=request.get_json()
        headers = request.headers
        if 'username' in data and 'message' in data and 'token' in headers:
            receiver=data['username']
            message=data['message']
            token=headers['token']

        if database_helper.check_user_logged_in_token(token):
            if re.search(r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", receiver):
                writer = database_helper.get_username_from_token(token)
                if database_helper.check_user_exists_email(receiver):
                    if database_helper.post_message(receiver,writer,message):
                        answer = {"success" : True, "message" : "Sucessfully posted message " , "data": "" }
                        notify_socket_message(writer)
                        notify_socket_message(receiver)
                    else:
                        answer = {"success" : False, "message" : "Unable to post message " , "data": "" }
                else: 
                    answer = {"success" : False, "message" : "No such user in the system" , "data": "" }
            else:
                answer = {"success" : False, "message" : "The username is not an email adress " , "data": "" }
        else:
            answer = {"success" : False, "message" : "You are not logged in anymore" , "data": "" }
        return json.dumps(answer), 200
    else:
        abort(404)

def read_template(filename):
    with open(filename, 'r', encoding='utf-8') as template_file:
        template_file_content = template_file.read()
    return Template(template_file_content)

@app.route('/recover_password/<username>', methods = ['GET'])
def recover_password(username):
    if request.method == 'GET' :
        headers = request.headers
        if database_helper.check_user_exists_email(username):
            #Generate new password 
            temp_pwd = secrets.token_hex(16)

            if database_helper.change_password_temp(username,temp_pwd):
                #Created a bot gmail account ... 
                address = "emailsenderproject6@gmail.com"
                pwd = "common6project6"
                
                #Setup and login SMTP server 
                s = smtplib.SMTP(host='smtp.gmail.com', port=25) #Or 465
                s.starttls()
                s.login(address, pwd)

                msg = MIMEMultipart()  

                #Initialize and set message template value
                #message_template = read_template("template_recovery.txt")
                #message = message_template.substitute(PERSON_NAME=username, NEW_PASSWORD=temp_pwd)

                # setup the parameters of the message
                msg['From']=address
                msg['To']=username
                msg['Subject']="Twidder : Password Recovery"

                # add in the message body
                msg.attach(MIMEText("Dear " +username+ ",\n\n You seem to have forgotten your password,\n here is a temporary one that you can use to login :\n         " + temp_pwd + "\nDon't forget to change your password once you're logged in ! \nLove, \nMom", 'plain'))

                # send the message via the server set up earlier.
                s.send_message(msg)
                
                del msg

                answer = {"success" : True, "message" : "Successfuly reset password, check your emails" , "data": "" }
            else:
                answer = {"success" : False, "message" : "Error : Unable to change password" , "data": "" }
        else :
            answer = {"success" : False, "message" : "No such user" , "data": "" }
        return json.dumps(answer), 200
    else:
        abort(404)

@app.route('/check_token/<username>', methods = ['GET'])
def check_token(username):
    if request.method == 'GET' :
        headers = request.headers
        if 'token' in headers:
            token=headers['token']
            if database_helper.check_user_exists_email(username):
                if database_helper.check_user_logged_in_e_t(username,token):
                    answer = {"success" : True, "message" : "Welcome Back" , "data": "" }
                else : 
                    answer = {"success" : False, "message" : "Wrong Username or Token" , "data": "" }
            else :
                answer = {"success" : False, "message" : "No such user " , "data": "" }
        else : 
            answer = {"success" : False, "message" : "Missing data" , "data": "" }
    return json.dumps(answer), 200


#Start Server 
if __name__ == '__main__' :
    app.debug = True 
    http_server = WSGIServer(('',5001), app, handler_class=WebSocketHandler) 
    http_server.serve_forever()