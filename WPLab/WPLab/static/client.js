

displayView = function(){
// the code required to display a view
};
window.onload = function(){

//code that is executed as the page is loaded.
//You shall put your own custom code here.
//window.alert() is not allowed to be used in your implementation.


  if(localStorage.getItem("token") == null){
    document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
  }
  else{
    document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;

    var userinfo = serverstub.getUserDataByToken(localStorage.getItem("token"));
    document.getElementById("userinformation").innerHTML = "<div> About me :</div> <div align='right'> Email: " + userinfo.data.email + "</div>" + "<div> First name: " +
    userinfo.data.firstname + "</div>" + "<div> Family name: " + userinfo.data.familyname + "</div>"
    + "<div> Gender: " + userinfo.data.gender + "</div>" + "<div > City: " + userinfo.data.city + "</div>"
    + "<div> Country: " + userinfo.data.country + "</div>";

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


  var signInData = {email: form.email.value, password: form.pwd.value, firstname: form.firstname.value,
  familyname: form.familyname.value, gender: form.gender.value, city: form.city.value, country: form.country.value};

  var result = serverstub.signUp(signInData);

  console.log(result.success + " " +  result.message);

  if(result.success){
    //form.submit.setCustomValidity(result.message);
    document.getElementById("errormsg").innerHTML = "<div>" + result.message + "</div>";
  }
  else{
    //form.email.setCustomValidity(result.message);
    document.getElementById("errormsg").innerHTML = "<div> Error: " + result.message + "</div>";
  }



  return true;

}


var signinSubmit = function(form){

   var result = serverstub.signIn(form.email.value, form.pwd.value);

   if(result.success){
     document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;
     localStorage.setItem("token", result.data);
     var userinfo = serverstub.getUserDataByToken(localStorage.getItem("token"));
    document.getElementById("userinformation").innerHTML = "<div> About me :</div> <div align='right'> Email: " + userinfo.data.email + "</div>" + "<div> First name: " +
    userinfo.data.firstname + "</div>" + "<div> Family name: " + userinfo.data.familyname + "</div>"
    + "<div> Gender: " + userinfo.data.gender + "</div>" + "<div > City: " + userinfo.data.city + "</div>"
    + "<div> Country: " + userinfo.data.country + "</div>";
     retrieveWall();

     return true;
   }

   else{
     document.getElementById("errormsg").innerHTML = "<div> Error: " + result.message + "</div>";
     return false;
   }

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

  if(form.newPwd.value != form.repPwd.value){

       document.getElementById("pwdError").innerHTML = "<div> Error: Passwords must match </div>";

    return false;
  }

  else{
      var result = serverstub.changePassword(localStorage.getItem("token"), form.oldPwd.value, form.newPwd.value);
      if(result.success){

        document.getElementById("pwdError").innerHTML = "<div>" + result.message + "</div>";
      }
      else{

        document.getElementById("pwdError").innerHTML = "<div> Error: " + result.message + "</div>";
      }
  }


}


var signOut = function(){

    var result = serverstub.signOut(localStorage.getItem("token"));

    if(result.success){
      localStorage.removeItem("token");
      document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
      document.getElementById("errormsg").innerHTML = "<div>  " + result.message + "</div>";
    }


}


var postToWall = function(form){

  var textToPost = form.postText.value;
  var email = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
  var result = serverstub.postMessage(localStorage.getItem("token"), textToPost, email);

  if(result.success){
    form.postText.value = "";
    //document.getElementById("homeError").innerHTML = "<div>  " + result.message + "</div>";
  }
  else{
    document.getElementById("homeError").innerHTML = "<div> Error: " + result.message + "</div>";
  }




}

var browsePostToWall = function(form){

  var textToPost = form.browsePostText.value;
  if(localStorage.getItem("search") != null){

    var result = serverstub.postMessage(localStorage.getItem("token"), textToPost, localStorage.getItem("search"));
    if(result.success){
      form.browsePostText.value = "";
      //document.getElementById("homeError").innerHTML = "<div>  " + result.message + "</div>";
    }
  }





}


var retrieveWall = function(){


    var messages = serverstub.getUserMessagesByToken(localStorage.getItem("token"));

    if(messages.success){
      document.getElementById("listofposts").innerHTML = "";
      for(var i=0; i < messages.data.length; i++){

          document.getElementById("listofposts").innerHTML += 
          "<div class='post'> <div class='writer' >Writer : "+messages.data[i].writer +" </div> <div class='messageContent'>"+ messages.data[i].content + "</div></div>";
      }
    }






}

var browseRetrieveWall = function(){

  if(localStorage.getItem("search") != null){

    var messages = serverstub.getUserMessagesByEmail(localStorage.getItem("token"), localStorage.getItem("search"));

    if(messages.success){
      document.getElementById("browseListofposts").innerHTML = "";
      for(var i=0; i < messages.data.length; i++){

          document.getElementById("browseListofposts").innerHTML += 
          "<div class='post'> <div class='writer' >Writer : "+messages.data[i].writer +" </div> <div class='messageContent'>"+ messages.data[i].content + "</div></div>";
    
      }
    }

  }


}


var getUser = function(form){
      var userinfo = serverstub.getUserDataByEmail(localStorage.getItem("token"), form.useremail.value);

      if(userinfo.success){

        localStorage.setItem("search", userinfo.data.email);

       
        document.getElementById("searchResult").innerHTML = "";
        document.getElementById("searchResult").innerHTML += document.getElementById("browseview").text;
        document.getElementById("browseUserinformation").innerHTML = "<div> Email: " + userinfo.data.email + "</div>" + "<div> First name: " +
        userinfo.data.firstname + "</div>" + "<div> Family name: " + userinfo.data.familyname + "</div>"
        + "<div> Gender: " + userinfo.data.gender + "</div>" + "<div> City: " + userinfo.data.city + "</div>"
        + "<div> Country: " + userinfo.data.country + "</div>";

        browseRetrieveWall();


      }

      else{
        document.getElementById("searchResult").innerHTML = userinfo.message;
        return false;
      }





}



/*
serverstub.signUp(dataobject)
Input: An object containing the following fields:
email, password, firstname, familyname, gender, city and country.

*/
