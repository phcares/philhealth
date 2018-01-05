firebase.firestore().enablePersistence()
var db = firebase.firestore();
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    	var user = firebase.auth().currentUser
    	var users = db.collection('users');
      	 users.where("email", "==", user.email).where("account_type", "==", "Admin").get().then(function(querySnapshot){
			if(querySnapshot.empty){
				$('#loginError').removeClass('hide');
        		$('#loginError').text('Invalid Email Address. Please try again.');	
        		$("#loginBtn").show();
    			$('#loginProgress').addClass('hide');
				
				firebase.auth().signOut().then(function() {
			    }).catch(function(error) {
			      alert(error.message);
			    });
			}else{
      			window.location.replace("dashboard.html");
			}
		});

    } else {
}});

function loginUser(){
	var email = $("#loginEmail").val();
    var password = $("#loginPassword").val();
    $("#loginBtn").hide();
    $('#loginProgress').removeClass('hide');

    if(email != "" && password != ""){

      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){
        $('#loginError').removeClass('hide');
        $('#loginError').text(error.message);
    	$("#loginBtn").show();
    	$('#loginProgress').addClass('hide');
        
      });
    }
}

$(document).on('click', '#loginBtn', function (event) {
  event.preventDefault();
  
  loginUser();
});
$("form#loginForm").on("submit",function(event){
	event.preventDefault();
	loginUser();
});
