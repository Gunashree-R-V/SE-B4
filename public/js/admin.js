
$(document).ready(function(){
    function selectTab(id) {
        var others = document.getElementsByClassName("hide");
        for (var i = 0; i < others.length; i++) {
            others[i].style.display = "none";
        }
        var tab = document.getElementById(id);
        tab.style.display = "block";
    }

    renderUsers = (users) => {
        var userApprovalTab = document.getElementById('student-approval-tab');

        for(var Index=0 ; Index < users.length ; Index++) {
            var User = document.createElement('div');
            User.className = 'approve-student';
            User.id = users[Index].usn;
            User.innerHTML = `
                <div class="approve-student-details">
                  <div><p>User ${Index}</p></div>
                   <div>USN : <span id="usn">${users[Index].usn}</span></div>
                </div>
                <div class="approve-student-buttons">
                    <button  class="approve"> Approve</button>
                </div>
                `;
            userApprovalTab.appendChild(User);
        }
    }
    updateTrips = (trips) => {

    }
    
    renderUsers1 = (users) => {
        var userApprovalTab = document.getElementById('myUL');
        for(var Index=0 ; Index < users.length ; Index++) {
            var User = document.createElement('li');
            User.innerHTML = `
            <div><p class="users">${users[Index].name}</p></div>
                `;
            userApprovalTab.appendChild(User);
        }
    }


    renderTrips = (trips) => {
        var trackTripsTab = document.getElementById('track-trips-tab');
        var temp=trackTripsTab;

        while (temp.firstChild) {
          var x=trackTripsTab.firstChild;
          if(typeof(x)!='undefined')
          {  console.log("Id= ",x.id);
              if(x.id!='map')
                temp.removeChild(temp.firstChild);
              else
                temp=temp.firstChild;
          }
      }
        for(var tripIndex=0 ; tripIndex < trips.length ; tripIndex++) {
            var trip = document.createElement('div');
            trip.className = 'approve-student';
            var temp=trips[tripIndex].routenumber;

            trip.innerHTML = `
                        <div class="approve-student-details">
                            <div><p>Route Number : ${trips[tripIndex].routenumber}</p></div>
                            <div><p>Bus Number   : ${trips[tripIndex].busnumber}</p></div>
                            <div><p>Driver Name : ${trips[tripIndex].drivername}</p></div>
                            <div><p>Time : ${trips[tripIndex].timing}</p></div>
                            <div><p>Number of Students : ${trips[tripIndex].noofstudents}</p></div>
                        </div>

                            `;
            trackTripsTab.appendChild(trip);
        }
    }

    renderMap = (json) =>{
      document.write('<script>initMap()</script>');

      var trackTripsTab = document.getElementById('track-trips-tab');
      var temp=trackTripsTab;

      }

    getTripDetails = (url) => {
        $.ajax({
            url:url,
            method:'GET',
            success:renderMap,
            error:displayError
        });
    }

    function blockStudents () {
        var get1 = document.getElementById("myInput").value;
       var data = { AId : get1,Func:"block"};
       var url = '/admin/block';  
       adminBlockRequest(data, url);
    }

    getToBlock = (url) => {
        $.ajax({
            url:url,
            method:'GET',
            success:renderUsers1,
            error:displayError
        });
    }

    getUsersRequest = (url) => {
        $.ajax({
            url:url,
            method:'GET',
            success:renderUsers,
            error:displayError
        });
    }
    getUpdateRequest = (url) =>{
      $.ajax({
        url:url,
        method:'GET',
        success:updateTrips,
        error:displayError
      });
    }
    getTripsRequest = (url) => {
        $.ajax({
            url:url,
            method:'GET',
            success:renderTrips,
            error:displayError
        });
    }

    $('#track-trips').on('click', () => {
        getTripsRequest('/tripList');
        selectTab('track-trips-tab');

    });

    $('#block-user').on('click',() => {
        getToBlock('/blockUserList');
        selectTab('block-user-tab')
    });

    $('#student-approval').on('click',() => {
        selectTab('student-approval-tab')
    });

    $('body').on('click','#confirmBlock',( function() { 
        ConfirmBlock();
    }));

    removeStudent = (student) => {
        alert("Approved the student successfully");
        $("#" +student.Id).remove();
    }

    blockStudent = (student) => {
        alert("blocked the student successfully");
    }

    $('#student-approval').on('click',() => {
        getUsersRequest('/userList');
        selectTab('student-approval-tab');
    });

    $('#update-trips').on('click',()=>{
      getUpdateRequest('/updateTrips');
      selectTab('update-trips-tab');
    })

    ConfirmBlock = () => {
        Metro.dialog.create({
        title: "Confirm Blocking",
        content: "<div>Are you sure you want to block this student ?</div>",
        actions:
        [
            {
                caption: "Yes",
                cls: "js-dialog-close alert",
               onclick:blockStudents,
            },
            {
                caption: "No",
                cls: "js-dialog-close",
            }
        ]
        });
    }

    SearchFilter = () => {
        var input, filter, ul, li, i, x;
        input = document.getElementById("myInput");
        x=input.value;
        ul = document.getElementById("myUL");
        if(x==null || x == ""){
            ul.style.display="none";
        }
        else {
            ul.style.display="block";
            filter = input.value.toUpperCase();
            li = ul.getElementsByTagName("li");
            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("div")[0].getElementsByTagName("p")[0];
                if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "";
                }
                else {
                    li[i].style.display = "none";
                }
            }
        }
    }

    $('#myInput').on('keyup', () => {
        SearchFilter();
    });

});

adminRequest = (data, url) => {
    $.ajax({
        async: true,
        url:url,
        data:data,
        method:'POST',
        success:removeStudent,
        error:displayError
    });
}

adminBlockRequest = (data, url) => {
    $.ajax({
        async: true,
        url:url,
        data:data,
        method:'POST',
        success:blockStudent,
        error:displayError
    });    
}


$('body').on('click','.approve',( function() {
    get1=$(this).parent().parent().children().children().children('span').text();
    var data = { AId : get1,Func:"approve"};
    var url = '/admin/approve';
    adminRequest(data, url);
}));

$('body').on('click','.users',( function() {
   def1 =$(this).text();
   $("#myInput").val(def1);
}));
