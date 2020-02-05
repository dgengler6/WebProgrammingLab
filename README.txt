In order to use the virtual environement just use : 

	. setup/bin/activate 

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
	

INSERT INTO users VALUES ('tim','pwd','tim','yeet','ree','er','ereer',NULL);
{"success" : "False", "message" : "Wrong username or password" , "data": "" }