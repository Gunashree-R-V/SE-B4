$(document).ready(function(){
    $('.cancelHandeller').click((event) => {
        tripID =  event.target.parentElement.parentElement.parentElement.id;
        Metro.dialog.create({
        title: "Cancel Trip",
        content: "<div>Are you sure you want to cancel this trip ?</div>",
        actions: 
        [
            {
                caption: "Yes",
                cls: "js-dialog-close alert",
                onclick: cancelTrip,
                
            },
            {
                caption: "No",
                cls: "js-dialog-close",
            }
        ]
        });
    });
    
    function cancelTrip () {
        usn1 = document.getElementById("studentUSN").innerHTML;
        usn = usn1.replace(/\s+/g,'');
        var data = {usn: usn , tripID :tripID};
        var url = '/cancelTrip';
        cancelRequest(data,url);
    }

    removerTrip = (responseUser) => {
        $("#" +tripID).remove();

    }

    displayError = (error) => {
        console.log(error);
    }

    cancelRequest =(data,url) => {
        $.ajax({
            url:url,
            data:data,
            method:'PUT',
            success:removerTrip,
            error:displayError
        });
    }

    $('#SOS').click(() => {
        const usn = document.getElementById('studentUSN').innerHTML;
        const pickupAddress = document.getElementById('pickUp').innerHTML;
        const dropAddress = document.getElementById('drop').innerHTML;
        emergencyRequest({usn: usn.replace(/\s+/g, ''), pickUp: pickupAddress, drop: dropAddress}, '/sos');
    });
    
    emergencyMessage = () => {
        alert('Alert sent to admin');
    }
    
    emergencyError = (error) => {
        console.log(error);
        alert('Unable to alert the admin');
    }
    
    emergencyRequest = (data, url) => {
        $.ajax({
            url:url,
            data:data,
            method:'GET',
            success:emergencyMessage,
            error:emergencyError
        });    
    }
    $('#proD').click(function(){ //id for profile details
        $('.p-4').empty();
        $('.p-4').append('<h3>My Profile Data</h3><form class="p-1 mt-4 mb-4"><input class="mt-2" id="name" type="text" data-role="input" data-clear-button="false" data-prepend="Name" /><input class="mt-2" id="usn" type="text" data-role="input" data-clear-button="false" data-prepend="USN" /><input class="mt-2 mb-2" id="email" type="email" data-role="input" data-clear-button="false" data-prepend="Email" /><div class="mb-4"><label>Contact Number</label><input id="contact" type="text" data-role="input" data-clear-button="false" data-prepend="+91" /></div>');
        $('input').attr('disabled','disabled');
        $('input[type=text]:disabled, input[type=email]:disabled').css('background-color','#fff');
        $('#name').val('Babayaga'); //dummy value
        $('#usn').val('8'); //dummy value
        $('#email').val('JohnWick@continental.com'); //dummy value
        $('#contact').val('aint got it'); //dummy value
    });
});
