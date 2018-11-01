$(document).ready(function(){
    loadTrips();
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
    function loadTrips()
    {
    obj=[
        {
        date:"11/10/2019",
        pickup:"living space girinagar",
        drop:"pes",
        time:"8:00"
        },
        {
         date:"11/10/2019",
        pickup:"pes",
        drop:"living space girinagar",
        time:"12:45"
        }
    ];
    var trips= document.getElementById("trips");
    for(var count=0; count<2;count++) {
        var codeblock=`  <br><br><br>
         <div class="row">
        <div class="col-xs-12">
            <div class="container my-card">
                <div class="row">
                    <div class="col-xs-12 col-md-9">
                        <div class="row">
                            <div class="col-md-12">
                                    <h2> <span id="change">${obj[count].date}</span></h2>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 text-muted">
                                <p>Pickup Location:<span id="change1">${obj[count].pickup}</span> <br> Drop Location: <span id="change2">${obj[count].drop}</span><br> Time of Pickup:<span id="change3">${obj[count].time}</span> </p>
                            </div>
                        </div>
                        <br>
                         <div class="row">
                             <div class="pr-2">
                                <button type="button" name="button" class="button info outline"> Cancel Trip <i class="mif-cancel"></i></button>
                            </div>
                            <div class="pr-2">
                                <button type="button" name="button" class="button info outline"> Change Time <span class="mif-alarm"></span></button>
                            </div>
                            <div class="pr-2">
                                <button type="button" name="button" class="button info outline"> Change Address <span class="mif-location-city"></span></button>
                            </div>
                            <div class="pr-2">
                                <button type="button" name="button" class="button info outline"> Track Bus Location <span class="mif-location"></span></button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
           </div>
           <br><br><br> `;
        var trip = document.createElement("div");
        trip.id="trip";
        trip.innerHTML = codeblock;
        trips.appendChild(trip);
    }

}
});