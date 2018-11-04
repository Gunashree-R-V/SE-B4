$(document).ready(function(){
    $('#CancelTrip').click(() => {
        Metro.dialog.create({
        title: "Cancel Trip",
        content: "<div>Are you sure you want to cancel this trip ?</div>",
        actions: 
        [
            {
                caption: "Yes",
                cls: "js-dialog-close alert",
            },
            {
                caption: "No",
                cls: "js-dialog-close",
            }
        ]
        });
    });

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
});