from flask import Flask 


app = Flask(__name__,static_url_path='')


import WPLab.server
import WPLab.Server
import WPLab.static



#app.debug = True 

if __name__ == '__main__' :
    app.run()
