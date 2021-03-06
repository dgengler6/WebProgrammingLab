
var nopChart;
var nliChart;
var tnpChart;



displayView = function(){
// the code required to display a view
};
window.onload = function(){
  //page('/Home');

  if(localStorage.getItem("token") == null || localStorage.getItem("email")==null){

    document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
    history.pushState({tabName: null}, "", "./");
  }
  else{

    check_token_reload();
    //history.pushState({tabName: 'Home'}, "", "./");
  }

}



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

        if(result.success){
          localStorage.setItem("token", result.data);
          localStorage.setItem("email", form.email.value);
          document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;
          //establish connection
          display_chart();
          establish_socket_connection();

          retrieveUserData();
          retrieveWall();
          history.pushState({tabName: 'Home'}, "", "./home");
          console.log(history.state);
          console.log("Testar sign in");

          //Should exist a better way to do this right?
          var tablinks = document.getElementsByClassName("tablinks");
          for (var i = 0; i < tablinks.length; i++) {
            if(tablinks[i].innerHTML == "Home"){
              tablinks[i].className += " active";
            }
            }


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

var forgotten_password = function(form){
  try{

    //var sign_in_data = {username: form.email.value, password: form.password.value};

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET","/recover_password/"+form.email.value,true);

    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status== 200){
          var result = JSON.parse(xhttp.responseText);

        if(result.success){
          document.getElementById("errormsg").innerHTML = "<div> " + result.message + "</div>";
        }else{
          document.getElementById("errormsg").innerHTML = "<div> Error: " + result.message + "</div>";
        }
      }
    }
    xhttp.send();
  }catch(e){
    console.log(e);
  }
    return true;
}

var confirm_forgotten_password = function(){
  try{
  document.getElementById("forgottenpwd").innerHTML = "<form onsubmit='forgotten_password(this);return false;' > <div> Email <input type='Email' name='email' placeholder='exempel@mail.com' required> </div> <div> <button type='submit' name='submit'>Reset my password</button></div></form>"
}catch(e){
  console.log(e)
}}



var openTab = function(event, tabName){

    if(history.state == null){
      history.pushState({tabName}, "", "./" + tabName.toLowerCase());
    }else if(history.state.tabName != tabName){
      history.pushState({tabName}, "", "./" + tabName.toLowerCase());
    }





  var tabcontent = document.getElementsByClassName("loggedintabs");

  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  var tablinks = document.getElementsByClassName("tablinks");

  for (var i = 0; i < tablinks.length; i++) {


    if(tablinks[i].innerHTML != tabName){
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    else{
      tablinks[i].className += " active";
    }


  }
  //console.log(tabName);
  document.getElementById(tabName).style.display = "block";


  //event.currentTarget.className += " active";

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
            history.pushState({tabName: null}, "", "./");
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
      }else{
        return false;
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
              "<div class='post'> <div class='writer' >Writer : "+messages.data[i].writer +" </div> <div draggable='true' ondragstart='drag(event)' class='messageContent' >"+ messages.data[i].content + "</div></div>";
          }                    // <div draggable="true" ondragstart="drag(event)">Hejhej</div>
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



/*
  Function call on reload of the page, it checks if the user is logged in on the server and chooses which view to display 
*/ 
var check_token_reload = function(){
  var xhttp = new XMLHttpRequest();

  xhttp.open("GET","/check_token/"+localStorage.getItem("email"),true);
  xhttp.setRequestHeader("token", localStorage.getItem("token"));

  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status== 200){
      var tokzer = JSON.parse(xhttp.responseText);

      if(tokzer.success){
        // If the user is logged in, displays the logged in view, establishes socket connection, displays charts and retrieve users data 
        document.getElementById("viewdiv").innerHTML = document.getElementById("loggedinview").text;
        establish_socket_connection();
        display_chart();
        retrieveUserData()
        retrieveWall();

        console.log("test");
        var url = window.location.href.split("/");
        var tabToOpen = url[url.length-1];
        if(tabToOpen != ""){
          openTab(event, tabToOpen.charAt(0).toUpperCase() + tabToOpen.slice(1));
        }else{


        }




      }else{
        // If not, displays the login view and removes the potential stale token 
        document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
        localStorage.removeItem("token");
        localStorage.removeItem("email");
      }
    }
  }
  xhttp.send();
}


// -------- How to esablish the socket connection and what to do when recieving a message from server --------

var establish_socket_connection = function(){
      var connection = new WebSocket("ws://" + document.domain + ":5001/connect");

      connection.onopen = function(){
          console.log("Websocket succesfully opened");
          var data = {"username":localStorage.getItem("email"),"token":localStorage.getItem("token")};
          connection.send(JSON.stringify(data));
      }

      connection.onmessage = function(msg){

        messageFromServer = JSON.parse(msg.data);
        console.log(messageFromServer.message);
        if('logout' in messageFromServer && messageFromServer.logout == true){
          console.log("Another user opened a session : signing out");
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          document.getElementById("viewdiv").innerHTML = document.getElementById("loginview").text;
          connection.close();
        }

        if('statistics' in messageFromServer && messageFromServer.statistics == true){
          if(messageFromServer.table == "NUMBER_LOGGED_IN"){
            var data = messageFromServer.data;

            update_chart(nliChart,data.TotalOnline,0);
            update_chart(nliChart,data.TotalUsers - data.TotalOnline,1);
          }
          if(messageFromServer.table == "USER_MESSAGE_STAT"){
            var data = messageFromServer.data;
            
            update_chart(nopChart,data.MsgOnYourWall,0);
            update_chart(nopChart,data.TotalContributed,1);
          }
          if(messageFromServer.table == "GLOBAL_MESSAGE_STAT"){
            update_chart(nopChart,messageFromServer.data,2);
          }

          if(messageFromServer.table == "PROFILE_VISIT_STAT"){
            console.log("here");
            console.log(messageFromServer);
            update_chart_profile_visit(tnpChart,messageFromServer.data.list[0],messageFromServer.data.day);
          }
        }

      }
      connection.onclose = function() {
  		  console.log("WebSocket closed");
  	  };

  	  connection.onerror = function() {
  		          console.log("ERROR!");
  	  };

  }




var display_chart = function(){
  your_posts_chart();
  logged_in_users_chart();
  total_posts_chart();
}

var update_chart = function(myChart, new_data,index){
  try{
      myChart.data.datasets[0].data[index] = new_data;
      myChart.update();

   }catch(e){
     console.log(e);
   }
}

var update_chart_profile_visit = function(myChart, weekly_data, current_day){
  try{
    switch(current_day){
      case "0" : 
        myChart.data.labels = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Today'];
        break;
      case "1" : 
        myChart.data.labels = ['Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Today'];
        break;
      case "2" : 
        myChart.data.labels = ['Wednesday','Thursday','Friday','Saturday','Sunday','Monday',  'Today'];
        break;
      case "3" :
        myChart.data.labels = ['Thursday','Friday','Saturday','Sunday','Monday','Tuesday',  'Today'];
        break;
      case "4" :
        myChart.data.labels = ['Friday','Saturday','Sunday','Monday','Tuesday', 'Wednesday',  'Today'];
        break;
      case "5" : 
        myChart.data.labels = ['Saturday','Sunday','Monday','Tuesday', 'Wednesday', 'Thursday', 'Today'];
        break;
      case "6" : 
        myChart.data.labels = ['Sunday','Monday','Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Today'];
        break;
      default : 
    }
      for (i = 0 ; i < 7 ; i++){
        myChart.data.datasets[0].data[i] = weekly_data[(i + parseInt(current_day,10))%7];
      }
      myChart.update();
    
   }catch(e){
     console.log(e);
   }
} 
var testouille = 0 ;
var test = function(){
  update_chart_profile_visit(tnpChart,[1,2,7,4,5,2,10],testouille);
  testouille++;
  if(testouille>6) testouille = 0;
}


// ------------------------- Here we define all statistics charts -----------------------------
var your_posts_chart = function(){
  var ctx = document.getElementById('numberOfPosts');
        nopChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Posts on your wall','Posts you contributed to','Number of posts on Twidder'],
                datasets: [{
                    label: '# of Posts',
                    data: [0,0,0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(99, 255, 132, 0.2)',
                        'rgba(99, 132, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(99, 255, 132, 1)',
                        'rgba(99, 132, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                  responsive: false,
                  maintainAspectRatio: false,

                scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
            }
         });


}

var logged_in_users_chart = function(){

  try{
  var ctx2 = document.getElementById('numberLoggedInUsers');
         nliChart = new Chart(ctx2, {
             type: 'pie',
             data: {
                 labels: ['Users Online','Users Offline'],
                 datasets: [{
                     label: '# of Posts',
                     data: [0,0],
                     backgroundColor: [
                         'rgba(132, 99, 255, 0.2)',
                         'rgba(128, 99, 132, 0.2)'
                     ],
                     borderColor: [
                         'rgba(132, 99, 255, 1)',
                         'rgba(128, 99, 132, 1)'
                     ],
                     borderWidth: 1
                 }]
             },
             options: {
                 maintainAspectRatio: false,
                 responsive: false,
             }
          });}catch(e){console.log(e);}
}

var total_posts_chart = function(){
  //Make this the number of visits to your profile. (Maybe time dependent, but not sure if easy )
  var ctx3 = document.getElementById('numberOfVisits');
  tnpChart = new Chart(ctx3, {
      type: 'line',
      data: {
        labels: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        datasets: [{ 
            data: [1,2,7,3,6,2,2],
            label: "Number of visits of your profile over last week",
            borderColor: "#3e95cd",
            fill: false
          }]
      },
      options: {
          maintainAspectRatio: false,
          responsive: false,
      }
   });
}

window.addEventListener('popstate', e => {
    if(e.state.tabName !== null){
      openTab(event, e.state.tabName);
    }
    else{
      signOut();
    }

});


function allowDrop(ev){
  ev.preventDefault();
}

function drag(ev){
  ev.dataTransfer.setData("text", ev.target.innerHTML);
}

function drop(ev){
  ev.preventDefault();

  var data = ev.dataTransfer.getData("text");
  console.log(data);
  ev.target.value += data + " ";
}
