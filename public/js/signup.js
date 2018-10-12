/**
 * Alert the user through a message if the USN is avaialble or not 
 */
$('#usn').focusout(() => {
    const data = { usn : $('#usn').val() };
    const url = "/existUSN"; 
    // Function which displays whether the USN is avaialable for use or not
    displayMessage = (res) => {
        $("#usn_response").show();
        if(res.exist) {
            $("#usn_response").html("<span class='not-exists'>* USN Already in use.</span>");     
            $('#regForm').prop('disabled', true);  
        }
        else {
            $("#usn_response").html("<span class='exists'>Available.</span>");
            $('#regForm').prop('disabled', false);
        }
    }
    // Ajax request to check the existence of USN
    $.ajax({
        url:url,
        data:data,
        success:displayMessage
    });
});
/**
 * Registration form 
 */
$("#regForm").click(function(){
    const name  = $("#name").val();
    const usn = $("#usn").val();
    const email = $("#email").val();
    const contact = $("#contact").val();
    const parentName = $("#parentName").val();
    const parentContact = $("#parentContact").val();
    const [latitude, longitude] = $("#end").val().split(",");
    const regData ={'name': name,'usn': usn, 'email': email, 'contact': contact, 'parentName': parentName, 'parentContact': parentContact, 'latitude': latitude, 'longitude': longitude};
    $.ajax({
        type : 'POST',
        url : '/registerStudent',
        data : regData,
        success: function(data){
            Metro.dialog.create({
                title: "Sign Up",
                content: "<div>You have successfully registered!</div>",
                actions: [
                    {
                        caption: "Okay",
                        cls: "js-dialog-close alert",
                        onclick: function(){
                            // Redirect to login page
                            window.location = `${location.protocol}//${location.host}/student/login.html`;
                        }
                    }
                ]
            });
            
        }
    });
  });