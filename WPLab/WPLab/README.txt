In order to use the virtual environement just use : 

	. setup/bin/activate 
	. venv/bin/activate (python3 env )

This should change the prompt and set you in the (setup) environnement 
To leave the environement use 

	deactivate 

Notes : 

Don't concatenate data to SQL commands, use prepare command 
def save_contact(name,number):
	try :
		get_db().execute("insert into contact values (?,?), [name ,number])
		return True;
	except :
	

{"success" : "False", "message" : "Wrong username or password" , "data": "" }

Email check 
CSS & HTML validation 
JSON queries 
3rd table for logged in users -- DONE


How many users online, posting on my wall ... -> Posting live statistics 

{"username":"tim3@hellberg.se","password":"timtimtimtim","firstName":"Tim","lastName":"Hellberg","gender":"Male","city":"Gothenburg","country":"Sweden"}

Override the connected user 