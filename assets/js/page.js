$(document).ready( function () {
$(".button-collapse").sideNav();
    getAllAdmins();
    getAllCares();
    getAllLogs();
    getAllArchivedAdmins();
    getAllArchivedCares();
    getAllUserReports();
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false, // Close upon selecting a date,
        formatSubmit: 'dd/mm/yyyy',
        onClose: function() {
            var x = this.get('select', 'd-m-yyyy');
            getReportByDate(x);
        }
      });
    $('.modal').modal();
    $('select').material_select();
    $('#reportCaresModal').modal({
        complete: function() { 
            $('#reportEmail').val('');
            $('#reportDate').val('');
            $('.reportErrorMessage').addClass('hide');
            $('.with-header').addClass('hide');
            $('.reportPrintBtn').addClass('disabled');
        }
    });
} );

// new Fingerprint2().get(function(result, components){
//   console.log(result); //a hash, representing your device fingerprint
//   console.log(components); // an array of FP components
// });
firebase.firestore().enablePersistence();
var db = firebase.firestore();
var logs = db.collection('logs');
firebase.auth().onAuthStateChanged(function(user) {
var user = firebase.auth().currentUser;
    if (user) {
       var user_email = user.email;
       console.log(user.email);
       var docRef = db.collection('users').where("email", "==", user_email);
       docRef.get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              $('#user_fullname').val(doc.data().first_name + ' ' + doc.data().middle_initial + ' ' + doc.data().last_name);
            });
        })
        .catch(function(error) {
            firebase.auth().signOut().then(function() {
              // Sign-out successful.
              window.location.replace('index.html');
            }).catch(function(error) {
              alert(error.message);
            });
        });

    } else {
      window.location.replace("./");
    }
});


$(".signOutBtn").click(function(){
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      window.location.replace('index.html');
    }).catch(function(error) {
      alert(error.message);
    });
});

// Admin Function
function getAllAdmins(){
  db.collection('users').where("account_type", "==", "Admin").where("status", "==", 'Active').onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#updateAdminModal" class="modal-trigger" id="updateAdminModalBtn" key="'
                        + change.doc.id +'">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td></tr>';
            $('#userListing').append(currentUser);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
              var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#updateAdminModal" class="modal-trigger" id="updateAdminModalBtn" key="'
                        + change.doc.id +'">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td></tr>';
            $('#userListing').append(currentUser);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });
          $('#userMaintenanceTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#userMaintenanceTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}

$(document).on('click', '#updateAdminModalBtn', function (event) {
  event.preventDefault();
  var adminID = $(this).attr("key");
  var docRef = db.collection("users").doc(adminID);
  
  docRef.get().then(function(doc) {
      if (doc.exists) {
          $('#updateAdminID').val(adminID);
          $('#updateAdminEmail').val(doc.data().email);
          $('#updateAdminFirstName').val(doc.data().first_name);
          $('#updateAdminLastName').val(doc.data().last_name);
          $('#updateAdminMiddleInitial').val(doc.data().middle_initial);
          $('#updateAdminEmployeeNumber').val(doc.data().emp_no);
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
});

$('#adminPassword').on('input',function() { 
  var password = $('#adminPassword').val();
  if(password.length < 6){
        $('#addErrorMsg').removeClass('hide');
        $('#addErrorMsg').html('Password should be atleast 6 characters.');
  }else{
        $('#addErrorMsg').addClass('hide');
  }
});

$('#adminCPassword').on('input',function() {
  var password = $('#adminPassword').val();
  var cPassword = $('#adminCPassword').val();

  if (password != cPassword) {
        $('#addErrorMsg').removeClass('hide');
        $('#addErrorMsg').html('Passwords do not match.');
        $('.addAdminBtn').addClass('disabled');
    } else {
        $('#addErrorMsg').addClass('hide');
        $('.addAdminBtn').removeClass('disabled');
    }
});

$(document).on('click', '.addAdminBtn', function (event) { 
  event.preventDefault();
  var emp_no = $('#adminEmployeeNumber').val();
  var first_name = $('#adminFirstName').val();
  var last_name = $('#adminLastName').val();
  var middle_initial = $('#adminMiddleInitial').val();
  var email = $('#adminEmail').val();
  var password = $('#adminPassword').val();

  db.collection("users").add({
      account_type: "Admin",
      email: email,
      emp_no: emp_no,
      first_name: first_name,
      last_name: last_name,
      middle_initial: middle_initial,
      status: 'Active'
  })
  .then(function(docRef) {
        $('#addNewAdminForm')[0].reset();
        Materialize.toast('Perfect! New Admin has been added.', 5000);
        $('#addNewAdmin').modal('close');
        var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Added New Admin Account (' + first_name + ' ' + middle_initial + ' ' + last_name + ')',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
  })
  .catch(function(error) {
       Materialize.toast('Oh No! An error occured.', 5000);
        $('#addNewAdmin').modal('close');       
  });

    secondaryApp.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
      // console.log("User " + firebaseUser.uid + " created successfully!");
      //I don't know if the next statement is necessary 
      secondaryApp.auth().signOut();
  });
});

$(document).on('click', '.deleteAdminSure', function (event) { 
  event.preventDefault();
  var adminID = $('#userID').val();
  var docRef = db.collection("users").doc(adminID);
  docRef.delete().then(function() {
      Materialize.toast('Perfect! User Account removed.', 5000);
      $('#deleteUserModal').modal('close');
      var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Updated User Account',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
  }).catch(function(error) {
      Materialize.toast('Oh No! An error occured.', 5000);
      $('#deleteUserModal').modal('close');
  });
});

$(document).on('click', '.deleteAdminBtn', function (event) { 
    event.preventDefault();
    var id = $("#updateAdminID").val();
    $('#userID').val(id);
    $('#updateAdminModal').modal('close');
});

$(document).on('click', '.updateAdminBtn', function (event) {
  event.preventDefault();
  var adminID = $('#updateAdminID').val();
  var first_name = $('#updateAdminFirstName').val();
  var last_name = $('#updateAdminLastName').val();
  var middle_initial = $('#updateAdminMiddleInitial').val();
  var emp_no = $('#updateAdminEmployeeNumber').val();
  var status = $('#updateAdminStatus').val();
  var docRef = db.collection("users").doc(adminID);
    docRef.update({
      emp_no: emp_no,
      first_name: first_name,
      last_name: last_name,
      middle_initial: middle_initial,
      status: status
    })
    .then(function() {
        Materialize.toast('Perfect! Profile has been updated.', 5000);
        $('#updateAdminModal').modal('close');
        var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Updated Admin Account (' + first_name + ' ' + middle_initial + ' ' + last_name + ')',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
    })
    .catch(function(error) {
        Materialize.toast('Oh No! An error occured.', 5000);
        $('#updateAdminModal').modal('close');
    });
});
//End Admin Funcrions

//Cares Account Functions
function getAllCares(){
  db.collection('users').where("account_type", "==", "Cares").where("status", "==", "Active").onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#updateCaresModal" class="modal-trigger" id="updateCaresModalBtn" key="'
                        + change.doc.id +'">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td><td>'+ change.doc.data().contact_no +'</td><td>'+ change.doc.data().status +'</td></tr>';
            $('#caresListing').append(currentUser);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
              var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#updateCaresModal" class="modal-trigger" id="updateCaresModalBtn" key="'
                        + change.doc.id +'">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td><td>'+ change.doc.data().contact_no +'</td><td>'+ change.doc.data().status +'</td></tr>';
            $('#caresListing').append(currentUser);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });
          $('#caresMaintenanceTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#caresMaintenanceTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}

function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}

$('#caresEmail').on('input',function() {
  var email = $('#caresEmail').val();

  if (!validateEmail(email)) {
        $('#addCareErrorMsg').removeClass('hide');
        $('#addCareErrorMsg').html('Please enter a valid email address.');
    } else {
        $('#addCareErrorMsg').addClass('hide');
    }
});
$(document).on('click', '.resetPassBtn', function (event) {
	var auth = firebase.auth();
	var emailAddress = $('#caresEmail').val();

	auth.sendPasswordResetEmail(emailAddress).then(function() {
	  // Email sent.
	}).catch(function(error) {
	  // An error happened.
	  console.log(error);
	});
});
$(document).on('click', '.addCaresBtn', function (event) {
  event.preventDefault();
  var emp_no = $('#caresEmployeeNumber').val();
  var first_name = $('#caresFirstName').val();
  var last_name = $('#caresLastName').val();
  var middle_initial = $('#caresMiddleInitial').val();
  var contact_no = $('#caresContact').val();
  var email = $('#caresEmail').val();
  var password = $('#caresPassword').val();

  var docRef = db.collection('users');

  secondaryApp.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
      console.log("User " + firebaseUser.uid + " created successfully!");
      //I don't know if the next statement is necessary 
      secondaryApp.auth().signOut();
  });

    docRef.add({
        account_type: "Cares",
        email: email,
        emp_no: emp_no,
        first_name: first_name,
        last_name: last_name,
        middle_initial: middle_initial,
        contact_no: contact_no,
        status: 'Active'
    })
    .then(function(docRef) {
          $('#addCaresForm')[0].reset();
          Materialize.toast('Perfect! New Cares Account has been added.', 5000);
          $('#addNewCares').modal('close');
          var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Added New CARES Account (' + first_name + ' ' + middle_initial + ' ' + last_name + ')',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
    })
    .catch(function(error) {
         Materialize.toast('Oh No! An error occured.', 5000);
          $('#addNewCares').modal('close');       
    });
});

$(document).on('click', '#updateCaresModalBtn', function (event) { 
  event.preventDefault();
  var id = $(this).attr("key");
  var docRef = db.collection('users').doc(id);
  docRef.get().then(function(doc) {
      if (doc.exists) {
          $('#caresID').val(id);
          $('#updateCaresEmployeeNumber').val(doc.data().emp_no);
          $('#updateCaresFirstName').val(doc.data().first_name);
          $('#updateCaresLastName').val(doc.data().last_name);
          $('#updateCaresMiddleInitial').val(doc.data().middle_initial);
          $('#updateCaresContact').val(doc.data().contact_no);
          $('#updateCaresEmail').val(doc.data().email);
          // $('select#updateCareStatus').val(doc.data().status);
          $('select#updateCareStatus option[value="' + doc.data().status + '"]').prop({defaultSelected: true});
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
});

$('#updateCaresPassword').on('input',function() { 
  var password = $('#updateCaresPassword').val();
  if(password.length < 6){
        $('#updateCaresErrorMsg').removeClass('hide');
        $('#updateCaresErrorMsg').html('Password should be atleast 6 characters.');
  }else{
        $('#updateCaresErrorMsg').addClass('hide');
  }
});

$('#updateCaresCPassword').on('input',function() {
  var password = $('#updateCaresPassword').val();
  var cPassword = $('#updateCaresCPassword').val();

  if (password != cPassword) {
        $('#updateCaresErrorMsg').removeClass('hide');
        $('#updateCaresErrorMsg').html('Passwords do not match.');
        $('.updateCaresBtn').addClass('disabled');
    } else {
        $('#updateCaresErrorMsg').addClass('hide');
        $('.updateCaresBtn').removeClass('disabled');
    }
});

$(document).on('click', '.updateCaresBtn', function (event) {
  event.preventDefault();
  var caresID = $('#caresID').val();
  var emp_no = $('#updateCaresEmployeeNumber').val();
  var first_name = $('#updateCaresFirstName').val();
  var last_name = $('#updateCaresLastName').val();
  var middle_initial = $('#updateCaresMiddleInitial').val();
  var contact_no = $('#updateCaresContact').val();
  var email = $('#updateCaresEmail').val();
  var password = $('#updateCaresPassword').val();
  var status = $('#updateCareStatus').val();
  var docRef = db.collection("users").doc(caresID);
    docRef.update({
      emp_no: emp_no,
      first_name: first_name,
      last_name: last_name,
      middle_initial: middle_initial,
      contact_no: contact_no,
      email: email,
      status: status
    })
    .then(function() {
        Materialize.toast('Perfect! Cares Account has been updated.', 5000);
        $('#updateCaresModal').modal('close');
        var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Updated CARES Account (' + first_name + ' ' + middle_initial + ' ' + last_name + ')',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
    })
    .catch(function(error) {
        Materialize.toast('Oh No! An error occured.', 5000);
        $('#updateCaresModal').modal('close');
    });
});

$(document).on('click', '.deleteCaresBtn', function (event) { 
    event.preventDefault();
    var id = $("#caresID").val();
    $('#userID').val(id);
    $('#updateCaresModal').modal('close');
});

//End Cares Account Functions

//Logs Functions
function getAllLogs(){
  db.collection('logs').orderBy('timestamp', 'desc').onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentLog = '<tr id="'+ change.doc.id +'"><td>' + change.doc.data().employee + '</td><td>' 
                        + change.doc.data().activity +'</td><td>'+ change.doc.data().timestamp +'</td></tr>';
                $('#logsListing').append(currentLog);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
                var currentLog = '<tr id="'+ change.doc.id +'"><td>' + change.doc.data().employee + '</td><td>' 
                        + change.doc.data().activity +'</td><td>'+ change.doc.data().timestamp +'</td></tr>';
                $('#logsListing').append(currentLog);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });
          $('#logsTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#logsTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}
//Archive Functions
function getAllArchivedAdmins(){
  db.collection('users').where('account_type', '==', 'Admin').where('status', '==', 'Archive').onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#archiveAdminModal" class="modal-trigger archiveAdminBtn" key="'+ change.doc.id +'">' + change.doc.data().emp_no + '</a></td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name +'</td><td>'+ change.doc.data().email +'</td></tr>';
                $('#archivedAdminListing').append(currentUser);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#archiveAdminModal" class="modal-trigger archiveAdminBtn" key="'+ change.doc.id +'">' + change.doc.data().emp_no + '</a></td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name +'</td><td>'+ change.doc.data().email +'</td></tr>';
                $('#archivedAdminListing').append(currentUser);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });          
        $('#archivedUsersAccountsTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#archivedUsersAccountsTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}

function getAllArchivedCares(){
  db.collection('users').where('account_type', '==', 'Cares').where('status', '==', 'Archive').onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#archiveCaresModal" class="modal-trigger archiveCaresBtn" key="'+ change.doc.id +'">' + change.doc.data().emp_no + '</a></td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name +'</td><td>'+ change.doc.data().email +'</td></tr>';
                $('#archivedCaresListing').append(currentUser);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#archiveCaresModal" class="modal-trigger archiveCaresBtn" key="'+ change.doc.id +'">' + change.doc.data().emp_no + '</a></td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name +'</td><td>'+ change.doc.data().email +'</td></tr>';
                $('#archivedCaresListing').append(currentUser);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });
          $('#archivedCareAccountsTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#archivedCareAccountsTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}

$(document).on('click', '.archiveAdminBtn', function (event) { 
  event.preventDefault();
  var id = $(this).attr("key");
  var docRef = db.collection('users').doc(id);
  docRef.get().then(function(doc) {
      if (doc.exists) {
          $('#archiveAdminID').val(id);
          $('#archiveAdminEmployeeNumber').val(doc.data().emp_no);
          $('#archiveAdminFirstName').val(doc.data().first_name);
          $('#archiveAdminLastName').val(doc.data().last_name);
          $('#archiveAdminMiddleInitial').val(doc.data().middle_initial);
          $('#archiveAdminEmail').val(doc.data().email);
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
});

$(document).on('click', '.removeArchiveAdminBtn', function (event) {
  event.preventDefault();
  var adminID = $('#archiveAdminID').val();
  var status = $('#archiveAdminStatus').val();
  var docRef = db.collection("users").doc(adminID);
    docRef.update({
      status: status
    })
    .then(function() {
        Materialize.toast('Perfect! Admin Account has been updated.', 5000);
        $('#archiveAdminModal').modal('close');
        var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Updated Archive Admin Account',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
    })
    .catch(function(error) {
        Materialize.toast('Oh No! An error occured.', 5000);
        $('#archiveAdminModal').modal('close');
    });
});


$(document).on('click', '.archiveCaresBtn', function (event) { 
  event.preventDefault();
  var id = $(this).attr("key");
  var docRef = db.collection('users').doc(id);
  docRef.get().then(function(doc) {
      if (doc.exists) {
          $('#archiveCaresID').val(id);
          $('#archiveCaresEmployeeNumber').val(doc.data().emp_no);
          $('#archiveCaresFirstName').val(doc.data().first_name);
          $('#archiveCaresLastName').val(doc.data().last_name);
          $('#archiveCaresMiddleInitial').val(doc.data().middle_initial);
          $('#archiveCaresEmail').val(doc.data().email);
      } else {
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
});

$(document).on('click', '.removeArchiveCaresBtn', function (event) {
  event.preventDefault();
  var adminID = $('#archiveCaresID').val();
  var status = $('#archiveCaresStatus').val();
  var docRef = db.collection("users").doc(adminID);
    docRef.update({
      status: status
    })
    .then(function() {
        Materialize.toast('Perfect! Cares Account has been updated.', 5000);
        $('#archiveCaresModal').modal('close');
        var employee = $('#user_fullname').val();
          logs.add({
            employee: employee,
            activity: 'Updated Archive Cares Account',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
    })
    .catch(function(error) {
        Materialize.toast('Oh No! An error occured.', 5000);
        $('#archiveCaresModal').modal('close');
    });
});
//End Archive Functions

$(document).on('click', '.myAccountBtn', function (event) {
  event.preventDefault();
  var user = firebase.auth().currentUser;
  var user_email = user.email;
  $('#myAccountEmail').val(user_email);
});

$('#myAccountPassword').on('input',function() { 
  var password = $('#myAccountPassword').val();
  if(password.length < 6){
        $('#myAccountErrorMsg').removeClass('hide');
        $('#myAccountErrorMsg').html('Password should be atleast 6 characters.');
  }else{
        $('#myAccountErrorMsg').addClass('hide');
  }
});

$('#myAccountCPassword').on('input',function() {
  var password = $('#myAccountPassword').val();
  var cPassword = $('#myAccountCPassword').val();

  if (password != cPassword) {
        $('#myAccountErrorMsg').removeClass('hide');
        $('#myAccountErrorMsg').html('Passwords do not match.');
        $('.updateMyAccountBtn').addClass('disabled');
    } else {
        $('#myAccountErrorMsg').addClass('hide');
        $('.updateMyAccountBtn').removeClass('disabled');
    }
});

$(document).on('click', '.updateMyAccountBtn', function (event) {
  event.preventDefault();

  var user = firebase.auth().currentUser;
  var password  = $('#myAccountPassword').val();

  user.updatePassword(password).then(function() {
    return Materialize.toast('Perfect! Your Account has been updated.', 5000);
    $('#myAccount').modal('close');
  }).catch(function(error) {
    console.log(error);
    return Materialize.toast('Oh No! An error occured.', 5000);
    $('#myAccount').modal('close');
  });
});

function getAllUserReports(){
  db.collection('users').where("account_type", "==", "Cares").where("status", "==", "Active").onSnapshot(function(snapshot) {
        snapshot.docChanges.forEach(function(change) {
            if (change.type === "added") {
                var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#reportCaresModal" class="modal-trigger" id="reportCaresModalBtn" key="'
                        + change.doc.id +'" email="' + change.doc.data().email + '" name="' + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td></tr>';
            $('#caresReportsListing').append(currentUser);
            }
            if (change.type === "modified") {
                $('tr#' + change.doc.id).remove();
              var currentUser = '<tr id="'+ change.doc.id +'"><td><a href="#reportCaresModal" class="modal-trigger" id="reportCaresModalBtn" key="'
                        + change.doc.id +'">' + change.doc.data().emp_no + '</td><td>' 
                        + change.doc.data().first_name + ' ' + change.doc.data().middle_initial + ' ' + change.doc.data().last_name + '</td><td>'+ change.doc.data().email +'</td></tr>';
            $('#caresReportsListing').append(currentUser);
            }
            if (change.type === "removed") {
                $('tr#' + change.doc.id).remove();
            }
        });
          $('#caresReportsTable').DataTable({
            responsive: true,
            "bLengthChange": false
          });

          $.fn.dataTable.ext.errMode = 'none';

        $('#caresReportsTable').on( 'error.dt', function ( e, settings, techNote, message ) { } ) ;
 });
}

$(document).on('click', '#reportCaresModalBtn', function (event) {
  event.preventDefault();
  var name = $(this).attr("name");
  var email = $(this).attr("email");
  var key = $(this).attr("key");
  $('.reportCaresName').text(name);
  $('#reportEmail').val(email);
});

function getReportByDate(date){
  var email = $('#reportEmail').val();
    $('.reportTimeIn1').text('');
    $('.reportTimeOut1').text('');
    $('.reportTimeIn2').text('');
    $('.reportTimeOut2').text('');
    $('.reportOverTimeIn').text('');
    $('.reportOverTimeOut').text('');
    $('.reportPlace').text('');

  var docRef = db.collection('timeRecords');
  docRef.where("user_email", "==", email).where("date", "==", date)
    .onSnapshot(function(snapshot) {
          if(snapshot.empty){
              $('.reportErrorMessage').removeClass('hide');
              $('.with-header').addClass('hide');
              $('.reportPrintBtn').addClass('disabled');
          }
        snapshot.docChanges.forEach(function(change) {
            $('.with-header').removeClass('hide');
            $('.reportErrorMessage').addClass('hide');
            $('.reportPrintBtn').removeClass('disabled');
          if (change.type === "added") {
                $('.reportDate').html(date);
                $('.reportTimeIn1').text(change.doc.data().timeIn1);
                $('.reportTimeOut1').text(change.doc.data().timeOut1);
                $('.reportTimeIn2').text(change.doc.data().timeIn2);
                $('.reportTimeOut2').text(change.doc.data().timeOut2);
                $('.reportOverTimeIn').text(change.doc.data().otTimeIn);
                $('.reportOverTimeOut').text(change.doc.data().otTimeOut);
                $('.reportPlace').text(change.doc.data().location);
            }
            if (change.type === "modified") {
                $('.reportDate').html(date);
                $('.reportTimeIn1').text(change.doc.data().timeIn1);
                $('.reportTimeOut1').text(change.doc.data().timeOut1);
                $('.reportTimeIn2').text(change.doc.data().timeIn2);
                $('.reportTimeOut2').text(change.doc.data().timeOut2);
                $('.reportOverTimeIn').text(change.doc.data().otTimeIn);
                $('.reportOverTimeOut').text(change.doc.data().otTimeOut);
                $('.reportPlace').text(change.doc.data().location);
            }
        });
    }); 
}


$('#adminEmployeeNumber').on('input',function() {
  var emp_no = $(this).val();
  checkEmpNo(emp_no);
});
function checkEmpNo(emp_no){
	
	 db.collection('users').where("emp_no", "==", emp_no).onSnapshot(function(snapshot) {
	 		if(snapshot.empty){
		 		$('#addErrorMsg').addClass('hide');
	 		}
	 	snapshot.docChanges.forEach(function(change){
	 		$('#addErrorMsg').removeClass('hide');
	 		$('#addErrorMsg').text('Employee Number has already been used. Please try again');
	 	});
	 });

}
