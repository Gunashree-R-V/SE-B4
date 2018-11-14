const pg = require('pg');
const Moment = require('moment');
const distance = require('euclidean-distance')
const config = require('../config');
const clusterMaker = require('clusters');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCCtwx1FLuy40tqWrXIBIxhxwCI-f71wXw',
  Promise: Promise
});
var resUser = {};

const sendMessage = (mobile_no,time,driver_name,driver_number) => {
  // console.log(`Hi\n Your trip has been booked.\nDriver will arrive at ${time}.\nDriver Name :- ${driver_name}.\n Driver Contact Details :- ${driver_number}\n`);
  // console.log(mobile_no);
  const accountSid = process.env.TWILIO_ACCOUNT_SID ;
  const authToken = process.env.TWILIO_AUTH_TOKEN ;
  const client = require('twilio')(accountSid, authToken);

  client.messages
  .create({
      body: `Hi\n Your trip has been booked.\nDriver will arrive at ${time}.\nDriver Name :- ${driver_name}.\nDriver Contact Details :- ${driver_number}\n`,
      from: process.env.TWILIO_PHONE_NO,
      to: mobile_no
  })
  .then(message => {
      console.log(message.sid)
  })
  .catch(err => {
  })
  .done();
}

const notifyStudent = (route_no, time, uid) => {
  const clientTrip = new pg.Client(config);
    const fetchQuery = `select mobile_no, driver_name, driver_number from (select mobile_no from stu_per_data where usn = (select usn from usn_uid where uid=${uid}) ) as student cross join 
    (select driver_name, mobile_no as driver_number from driver where driver_id = (select driver_id from trip where route_no = ${route_no})) as driver`;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() =>
            clientTrip.query(fetchQuery)
                .then(res => {
                  res.rows.forEach(row => {
                    // console.log(row)
                    sendMessage(row.mobile_no,time,row.driver_name,row.driver_number)
                  })
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(async () => {
                    resolve(resUser.AId);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });
}


const approveUser = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const approveQuery = `SELECT adminApproves('${userUSN.AId}');`;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() =>
            clientTrip.query(approveQuery)
                .then(res => {
                        resUser.AId=userUSN.AId;

                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(async () => {
                    resolve(resUser.AId);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });
}
const tripJson = (routeNumber)=>
{
  return new Promise((resolve, reject)=>{
    console.log("route number ="+routeNumber);
    const get_json= `select route_data from trip where route_no=${routeNumber}`;
    const clientTrip = new pg.Client(config);
    clientTrip.connect()
    .then(()=>
    {
      clientTrip.query(get_json)
      .then((res)=>
      {
        var request = require('request');
        request(res.rows[0].route_data, function (error, response, body) {
          if (!error && response.statusCode == 200) {
             var importedJSON = JSON.parse(body);
             console.log(importedJSON);
             resolve(importedJSON);
          }
        })
      })

    })
  })


}
const updateTrips = (user) => {

  const getTripId = () =>{
    return new Promise((resolve,reject) =>{
      const get_trip_id='select * from  Fut_trip order by  trip_date,timing';
      const clientTrip = new pg.Client(config);
      clientTrip.connect()
      .then(()=>
      {
        clientTrip.query(get_trip_id)
        .then((res)=>
        {
          clientTrip.end();
          console.log("current trip_id= "+res.rows[0].trip_id);
          resolve(res);
        },function(err)
        {
          clientTrip.end();
          reject(err);
        })
      })
    });
  }
  const getUids = (uid) =>{
    return new Promise((resolve,reject)=>
    {
      const clientTrip = new pg.Client(config);
      const get_uids = 'select uid from stu_trip_data';
      clientTrip.connect()
      .then(()=>
      {
        clientTrip.query(get_uids)
        .then((res)=>
        {
          console.log("uid of student in syu_trip_data= "+res.rows);
          resolve(res.rows);
        })

      })
    });
  }


  const getAvlDriverBus = (user) =>{
    const dbCon = new pg.Client(config);
    const getAvlDrivers = "select driver_id from driver";
    const getAvlBuses = "select bus_no from bus";
    // const getAvlDrivers = "select driver_id from driver where driver_id not in (select driver_id from trip where trip_date=current_date+1 and timing= '8:00')";
    // const getAvlBuses = "select bus_no from bus where bus_no not in (select bus_no from trip where trip_date=current_date+1 and timing= '8:00')";
    return new Promise((resolve,reject)=>{
      dbCon.connect()
      .then(() =>
      {
        dbCon.query(getAvlDrivers)
        .then(res => {
          dbCon.query(getAvlBuses)
            .then(res2 =>{
              dbCon.end();
              // console.log(res2);
              resolve([res,res2]);

            })
            .catch(err => {
                reject(err);
                console.log(`Fetch error: ${err}`);
            })
          })
          .catch(err => {
              reject(err);
              console.log(`Fetch error: ${err}`);
          })
        })
        .catch(err => {
            reject(err);
            console.log(`Fetch error: ${err}`);
        })


    });
  }
  const getLocationForTrip = () =>
  {
    return new Promise((resolve,reject)=>
    {
      const clientTrip = new pg.Client(config);
      const location_chan_loc = "select uid,latitude,longitude from chan_loc where trip_id in (select trip_id from  Fut_trip order by  trip_date,timing limit 1)  and UID in(select uid from stu_trip_data where uid not in(select cancel_trip.uid from cancel_trip inner join stu_trip_data on  cancel_trip.uid = stu_trip_data.uid where cancel_trip.trip_id=1))";
      const location = "select uid,latitude,longitude from stu_trip_data where uid not in (select uid from cancel_trip where trip_id in (select trip_id from  Fut_trip order by  trip_date,timing limit 1))";
      clientTrip.connect()
      .then(()=>{
        clientTrip.query(location_chan_loc)
        .then((res)=>{
          console.log("Students in the chan_loc trip "+res.rows);
          clientTrip.query(location)
          .then((res1)=>
          {
            clientTrip.end();
            resolve([res,res1]);
          })

        })
      })
    });

  }
  const optimize=(clusters)=>
  {
    for(var i=0;i<clusters.length;i++)
    {
      var minDist=-1;
      var minIndex=-1;
      for(var j=i+1;j<clusters.length;j++)
      {
        if(clusters[i].points.length +clusters[j].points.length<21)
        {
          var dist=distance[clusters[i].centroid,clusters[j].centroid];
          if(minDist==-1 || minDist>distance)
          {
            minDist=dist;
            minIndex=j;
          }
        }
      }
      if(minIndex!=-1)
      {
        for(var x=0;x<clusters[i].points.length;x++)
        {
          clusters[minIndex].points.push(clusters[i].points[x]);
        }
        delete clusters[i];
      }

    }
    return clusters;
  }
  const calcRoutes = (cluster,res1,dict,i,res)=>{
    const getDropPick= (tripId)=>
    {
      return new Promise((resolve, reject)=>{
        const get_drop_pick=`select drop_pick from fut_trip where trip_id=${tripId}`;
        const dbConn = new pg.Client(config);
        dbConn.connect();
        dbConn.query(get_drop_pick)
        .then((res)=>{
          resolve(res.rows[0].drop_pick);
        })
      })
    }
    console.log("points =",cluster.points);
    googleMapsClient.directions({
      origin: [12.934528, 77.533794],
      destination: [12.934528, 77.533794],
      waypoints: cluster.points,

      optimize: true,
      mode: 'driving',
      departure_time: new Date(Date.now()+18000000)


    }) .asPromise()
    .then((route_data) => {
      console.log(route_data.json);

      const dbConn = new pg.Client(config);
      dbConn.connect();
      // console.log(response.requestUrl);
        res=res+i;
        console.log("res1= "+res1[0].rows[i].driver_id);
        getTripId()
        .then((fut_trip)=>
        {
          getDropPick(fut_trip.rows[0].trip_id)
          .then((dropPick)=>{


          var durationObj=route_data.json.routes[0].legs;
          var total_duration=0;
          var datetime = Moment(fut_trip.rows[0].timing,'HH:mm:ss');

          for(var iter=0;iter<durationObj.length;iter++)
          {
            total_duration+=durationObj[iter].duration.value;
          }
          bus_time=datetime;
          if(dropPick==false)
            var bus_time=datetime.subtract(total_duration,'seconds');
          console.log(bus_time);
          var date=fut_trip.rows[0].trip_date.getFullYear()+'-'+fut_trip.rows[0].trip_date.getMonth()+'-'+fut_trip.rows[0].trip_date.getDate();
          console.log(typeof(fut_trip.rows[0].trip_date));
          var time=bus_time.hour()+":"+bus_time.minute()+":"+bus_time.second();
          const storeTrip = `INSERT INTO Trip (route_no,No_of_stu, timing, Bus_no, Driver_id, trip_id,trip_date,route_data) VALUES(${res},${cluster.points.length},'${time}','${res1[1].rows[i].bus_no}', '${res1[0].rows[i].driver_id}',${fut_trip.rows[0].trip_id},'${date}','${route_data.requestUrl}')`;


          dbConn.query(storeTrip)
          .then(res1=>{
            // console.log(res1.rows[0]['max']);

            console.log("Total_duration=",total_duration);
            for(var i=0;i<cluster.points.length;i++)
            {
              // console.log("key used= "+cluster.points[i][0]+''+cluster.points[i][1]);
              var uid=dict[cluster.points[i][0]+''+cluster.points[i][1]].pop();
              var wp_order=route_data.json.routes[0].waypoint_order;
              var wp_index=0;
              var stu_time=Moment(bus_time);
              for(var itrer=0;iter<wp_order.length;iter++)
              {
                if (wp_order[iter]==i)
                {
                  wp_index=iter;

                  break;
                }
              }

              var durationObj=route_data.json.routes[0].legs;

              var temp=0;
              for(var iter=0;iter<wp_index+1;iter++)
              {
                  temp+=durationObj[iter].duration.value;
                  console.log("Temp=",temp);
              }

              stu_time=stu_time.add(temp,'seconds');
              var time=stu_time.hour()+":"+stu_time.minute()+":"+stu_time.second();
              console.log("Time for student ",stu_time);
              const store_stu_trip = `update stu_trip_data set route_no=${res} , timing='${time}'where uid = ${uid}`;

              const notify = false
              if(notify) {
                notifyStudent(res, time, uid);
              }

              dbConn.query(store_stu_trip)
              .then(res=>
                {
                  console.log("Success");
                })
            }


          })

      })
    })

    })
    }
    var dataset = new Array();
    const clientTrip = new pg.Client(config);

    return new Promise((resolve,reject) => {
        clientTrip.connect()
          .then(() =>
          getLocationForTrip()
          .then(res => {
                      clientTrip.end();
                      var dict =[];
                      var latlang=[];
                      for(var j=0;j<2;j++)
                      {
                        for(var i=0;i<res[j].rows.length;i++)
                        {

                          latlang.push([res[j].rows[i].latitude,res[j].rows[i].longitude]);
                          if(typeof dict[res[j].rows[i].latitude + '' + res[j].rows[i].longitude]=='undefined')
                          {
                            dict[res[j].rows[i].latitude + '' + res[j].rows[i].longitude]=[res[j].rows[i].uid];
                          }
                          else
                          {
                            dict[res[j].rows[i].latitude + '' + res[j].rows[i].longitude].push(res[j].rows[i].uid);
                          }


                        }
                      }
                      var clust_num=6;
                      clusterMaker.k(clust_num);
                      clusterMaker.iterations(750);
                      clusterMaker.data(latlang);
                      clusters=clusterMaker.clusters();
                      console.log("Unoptimized clusters "+clusters);

                      clusters=optimize(clusters);
                      console.log("optimized Clusters"+clusters);
                      getAvlDriverBus().then(function(res1)
                      {
                        // console.log(res1[1]);
                        const clientTrip = new pg.Client(config);
                        clientTrip.connect();


                        clientTrip.query('delete from trip')
                        .then(()=>{
                          clientTrip.end();
                          var skipCount=0;
                          for(var i=0;i<clusters.length;i++)
                          {

                            if(typeof(clusters[i])!='undefined')
                              calcRoutes(clusters[i],res1,dict,i-skipCount,0);
                            else
                              skipCount+=1;
                          }
                        })
                      });
                        const clientTrip1 = new pg.Client(config);
                        clientTrip1.connect()
                        clientTrip1.query('select * from trip')
                        .then(res=>
                        {
                          clientTrip1.end();
                          dataset=res;
                        })

          })
          .catch(err => {
            reject(err);
            console.log(`Fetch error: ${err}`);
          })
          .then(async ()=>{
            resolve(dataset);
            clientTrip.end();
          })
        )
        .catch(err => {
          reject(err);
          console.log(`Connection error: ${err}`);
        });
      });
}

const blockUser = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const disapproveQuery = `UPDATE Stu_Per_Data SET Status = 'f' WHERE name = '${userUSN.AId}'`;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() =>
            clientTrip.query(disapproveQuery)
                .then(res => {
                            resUser.AId=userUSN.AId;
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(async () => {
                    resolve(resUser.AId);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });
}

const getUsers =  (user) => {
    var users = [];
    const client = new pg.Client(config);
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
                var usersQuery = `SELECT  usn as usn from Stu_per_data where status='f';`;
                client.query(usersQuery)
                    .then((res)=>{
                        res.rows.forEach(user1 => {
                            users.push(user1);
                        })
                        resolve(users);
                        client.end();
                        })
                        .catch(err => {
                            console.log(`Fetch error: ${err}`);
                            reject(err);
                        });
                })
                .catch(err => {
                   console.log(`Connection error: ${err}`);
                   reject(err);
               });
        });
}


const getBlockUsers =  (user) => {
    var users = [];
    const client = new pg.Client(config);
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
                var usersQuery = `SELECT  name as name from Stu_per_data where status='t';`;
                client.query(usersQuery)
                    .then((res)=>{
                        res.rows.forEach(user1 => {
                            users.push(user1);
                        })
                        resolve(users);
                        client.end();
                        })
                        .catch(err => {
                            console.log(`Fetch error: ${err}`);
                            reject(err);
                        });
                })
                .catch(err => {
                   console.log(`Connection error: ${err}`);
                   reject(err);
               });
        }); 
}


const getTrips =  (user) => {
    var trips = [];
    const client = new pg.Client(config);
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
               var tripsQuery = `SELECT route_no as routeNumber, no_of_stu as noOfStudents, timing, bus_no as busNumber, driver.driver_name as driverName from trip, driver where driver.driver_id = trip.driver_id;`;
                client.query(tripsQuery)
                    .then((res)=>{
                        res.rows.forEach(trip => {
                            trips.push(trip);
                        })
                        resolve(trips);
                        client.end();
                        })

                    .catch(err => {
                        console.log(`Fetch error: ${err}`);
                        reject(err);
                    });
            })
            .catch(err => {
               console.log(`Connection error: ${err}`);
               reject(err);
           });
    });
}


module.exports = { approveUser, blockUser, getUsers, getTrips, getBlockUsers, updateTrips, tripJson };

