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
});