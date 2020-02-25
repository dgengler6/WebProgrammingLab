

displayView = function(){
// the code required to display a view
};
window.onload = function(){

  if(localStorage.getItem("token") == null){
    document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
  }
  else{
    document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;

    //Establish/re-establish a socket connection
    establish_socket_connection();
    retrieveUserData();
    retrieveWall();
  }
};

var signupSubmit = function(form){
  var reqlength = 10;



  if(form.pwd.value != form.repPwd.value){

       /* dosn't show up immedietly */
       document.getElementById("errormsg").innerHTML = "<div> Error: Passwords must match </div>";

    return false;
  }


  var signUpData = {username: form.email.value, password: form.pwd.value, firstName: form.firstname.value,
  lastName: form.familyname.value, gender: form.gender.value, city: form.city.value, country: form.country.value};

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST","/sign_up",true);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
      var result = JSON.parse(xhttp.responseText);

      if(result.success){
        //form.submit.setCustomValidity(result.message);
        document.getElementById("errormsg").innerHTML = "<div>" + result.message + "</div>";
      }
      else{
        //form.email.setCustomValidity(result.message);
        document.getElementById("errormsg").innerHTML = "<div> Error: " + result.message + "</div>";
      }
    }
  }
  xhttp.send(JSON.stringify(signUpData));

  return true;

}


var signinSubmit = function(form){
  try{

    var sign_in_data = {username: form.email.value, password: form.password.value};

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST","/sign_in",true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status== 200){
          var result = JSON.parse(xhttp.responseText);

          console.log(result);
        if(result.success){
          localStorage.setItem("token", result.data);
          localStorage.setItem("email", form.email.value);
          document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;
          retrieveUserData();
          retrieveWall();

          //establish connection
          establish_socket_connection();

        }else{
          document.getElementById("errormsg").innerHTML = "<div> Error: " + result.message + "</div>";
        }
      }
    }
    xhttp.send(JSON.stringify(sign_in_data));
  }catch(e){
    console.log(e);
  }
    return true;

}



var openTab = function(event, tabName){


  var tabcontent = document.getElementsByClassName("loggedintabs");

  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  var tablinks = document.getElementsByClassName("tablinks");

  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}



var changePassword = function(form){
  try{
    if(form.newPwd.value != form.repPwd.value){

        document.getElementById("pwdError").innerHTML = "<div> Error: Passwords must match </div>";

      return false;
    }

    else{

      httpChangePassword(form);
    }
  }catch(e){
    console.log(e);
  }
}


var signOut = function(){


    var xhttp = new XMLHttpRequest();
    xhttp.open("POST","/sign_out",true);
    xhttp.setRequestHeader("token", localStorage.getItem("token"));
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status== 200){
          var result = JSON.parse(xhttp.responseText);
          if(result.success){
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
            document.getElementById("errormsg").innerHTML = "<div>  " + result.message + "</div>";
          }
      }
    }

  xhttp.send();
  return true;
}


var postToWall = function(form){


  //var email = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
  //var result = serverstub.postMessage(localStorage.getItem("token"), textToPost, email);

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET","/get_user_data_token",true);
  xhttp.setRequestHeader("token", localStorage.getItem("token"));
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
        var userData = JSON.parse(xhttp.responseText);
        var textToPost = {"username": userData.data.email,"message": form.postText.value};

        if(userData.success){
          var xhttpInner = new XMLHttpRequest();
          xhttpInner.open("POST","/post_message",true);
          xhttpInner.setRequestHeader("token", localStorage.getItem("token"));
          xhttpInner.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhttpInner.onreadystatechange = function(){
            if(this.readyState == 4 && this.status== 200){
              var result = JSON.parse(xhttpInner.responseText);
              if(result.success){
                form.postText.value = "";
                //document.getElementById("homeError").innerHTML = "<div>  " + result.message + "</div>";
              }
              else{
                document.getElementById("homeError").innerHTML = "<div> Error: " + result.message + "</div>";
              }
            }
          }
          xhttpInner.send(JSON.stringify(textToPost));
        }
    }
  }
  xhttp.send();





}

var browsePostToWall = function(form){
  try{
  var textToPost = form.browsePostText.value;
  if(localStorage.getItem("search") != null){

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/post_message", true);
    xhttp.setRequestHeader("token", localStorage.getItem("token"));
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var paramsToSend = {"message": textToPost, "username": localStorage.getItem("search")};
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status== 200){
          var result = JSON.parse(xhttp.responseText);
          if(result.success){
            form.browsePostText.value = "";
            //document.getElementById("homeError").innerHTML = "<div>  " + result.message + "</div>";
          }

      }
    }

    xhttp.send(JSON.stringify(paramsToSend));

  }

}catch(e){
  console.log(e);
}


  }




var retrieveUserData = function(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET","/get_user_data_token",true);
  xhttp.setRequestHeader("token", localStorage.getItem("token"));
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
        var userinfo = JSON.parse(xhttp.responseText);

        if(userinfo.success){
        document.getElementById("userinformation").innerHTML = "<div> About me :</div> <div align='right'> Email: " + userinfo.data.email + "</div>" + "<div> First name: " +
        userinfo.data.firstName + "</div>" + "<div> Family name: " + userinfo.data.lastName + "</div>"
        + "<div> Gender: " + userinfo.data.gender + "</div>" + "<div > City: " + userinfo.data.city + "</div>"
        + "<div> Country: " + userinfo.data.country + "</div>";
      }
    }
  }
  xhttp.send();
}

var retrieveWall = function(){


  var xhttp = new XMLHttpRequest();
  xhttp.open("GET","/get_user_messages_token",true);
  xhttp.setRequestHeader("token", localStorage.getItem("token"));
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
        var messages = JSON.parse(xhttp.responseText);
        if(messages.success){
          document.getElementById("listofposts").innerHTML = "";
          for(var i=0; i < messages.data.length; i++){

              document.getElementById("listofposts").innerHTML +=
              "<div class='post'> <div class='writer' >Writer : "+messages.data[i].writer +" </div> <div class='messageContent'>"+ messages.data[i].content + "</div></div>";
          }
        }

    }
  }
  xhttp.send();

}

var browseRetrieveWall = function(){

  if(localStorage.getItem("search") != null){

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/get_user_messages_email/" + localStorage.getItem("search"), true);

    xhttp.setRequestHeader("token", localStorage.getItem("token"));
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status== 200){
        var messages = JSON.parse(xhttp.responseText);
        if(messages.success){
          document.getElementById("browseListofposts").innerHTML = "";
          for(var i=0; i < messages.data.length; i++){

              document.getElementById("browseListofposts").innerHTML +=
              "<div class='post'> <div class='writer' >Writer : "+messages.data[i].writer +" </div> <div class='messageContent'>"+ messages.data[i].content + "</div></div>";

          }
        }


      }
    }
    xhttp.send();





  }


}


var getUser = function(form){

      var xhttp = new XMLHttpRequest();
      xhttp.open("GET","/get_user_data_email/"+form.useremail.value,true);
      xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhttp.setRequestHeader("token", localStorage.getItem("token"));

      xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status== 200){
            var userinfo = JSON.parse(xhttp.responseText);
            if(userinfo.success){

              localStorage.setItem("search", userinfo.data.email);


              document.getElementById("searchResult").innerHTML = "";
              document.getElementById("searchResult").innerHTML += document.getElementById("browseview").text;
              document.getElementById("browseUserinformation").innerHTML = "<div> Email: " + userinfo.data.email + "</div>" + "<div> First name: " +
              userinfo.data.firstName + "</div>" + "<div> Family name: " + userinfo.data.lastName + "</div>"
              + "<div> Gender: " + userinfo.data.gender + "</div>" + "<div> City: " + userinfo.data.city + "</div>"
              + "<div> Country: " + userinfo.data.country + "</div>";

              browseRetrieveWall();

            }

            else{
              document.getElementById("searchResult").innerHTML = userinfo.message;
            }

        }
      }
      xhttp.send();








}



var httpFunction = function(sendFunction, route, sendData, token){

  var xhttp = new XMLHttpRequest();
  xhttp.open(sendFunction,route,true);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  if(token != NULL){
    xhttp.setRequestHeader("token", token);
  }

  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
        var result = JSON.parse(xhttp.responseText);
        return result;
    }
  }
  xhttp.send(JSON.stringify(sendData));

}


var httpChangePassword = function(form){

  var xhttp = new XMLHttpRequest();
  xhttp.open("post","/change_password", true);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.setRequestHeader("token", localStorage.getItem("token"));
  var data = {"oldPassword": form.oldPwd.value, "newPassword": form.newPwd.value};


  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
        var result = JSON.parse(xhttp.responseText);

      if(result.success){

        document.getElementById("pwdError").innerHTML = "<div>" + result.message + "</div>";
      }
      else{

        document.getElementById("pwdError").innerHTML = "<div> Error: " + result.message + "</div>";
      }

    }
  }
  xhttp.send(JSON.stringify(data));

  return true;
}


var establish_socket_connection = function(){
      var connection = new WebSocket("ws://" + document.domain + ":5001/connect");

      connection.onopen = function(){
          console.log("Websocket succesfully opened");
          var data = {"username":localStorage.getItem("email"),"token":localStorage.getItem("token")};
          console.log(data);
          console.log("Data sent to websocket: " + JSON.stringify(data));
          connection.send(JSON.stringify(data));

      }

      connection.onmessage = function(msg){

        messageFromServer = JSON.parse(msg.data);
        console.log(messageFromServer.message);
        if(messageFromServer.logout == true){
          console.log("signing out");
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
          connection.close();
        }
        
      }
      connection.onclose = function() {
  		          console.log("WebSocket closed");
  	  };

  	  connection.onerror = function() {
  		          console.log("ERROR!");
  	  };

      
  }
