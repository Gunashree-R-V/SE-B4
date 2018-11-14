const pg = require('pg');
const config = require('../config');
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: process.env.GEOCODE_KEY, 
    formatter: null
  };

var resUser = {};
/**
 * Checks the availability of the USN during registration
 * @param {userdID} 
 * @returns Promise<object> 
 */
const fetchDriverTrips = (userdID) => {
    const clientTrip = new pg.Client(config);
    const futureTripQuery = `SELECT Route_no,No_of_stu,Bus_no,timing,trip_date from Trip where Trip.driver_id='${userdID}'`;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() => 
            clientTrip.query(futureTripQuery)
                .then(res => {
                        resUser.driverTrips = [];
                        res.rows.forEach(row => {
                            resUser.driverTrips.push(row);
                        });
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(async () => {
                    resolve(resUser.driverTrips);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });

}

const fetchCurrentTrips = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const futureTripQuery = `SELECT trip.bus_no, driver.driver_name, driver.mobile_no, trip.timing, (select getPickUpLocation('${userUSN}')) as getcurentlocation FROM stu_trip_data, trip, driver WHERE stu_trip_data.route_no = trip.route_no AND stu_trip_data.uid = (select uid from usn_uid where usn='${userUSN}') AND trip.driver_id = driver.driver_id;`;
    resUser.CurrentTrip = null;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() => 
            clientTrip.query(futureTripQuery)
                .then(res => {
                        res.rows.forEach(row => {
                            resUser.CurrentTrip =  row;
                            resUser.CurrentTrip.getcurentlocation = resUser.CurrentTrip.getcurentlocation.slice(1,-1).split(',');
                            resUser.CurrentTrip.latitudeLongitude = resUser.CurrentTrip.getcurentlocation;
                        });
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error CurrentTrip: ${err}`);
                })
                .then(async () => {
                    var geocoder = NodeGeocoder(options);
                        if(resUser.CurrentTrip != null && resUser.CurrentTrip.getcurentlocation != null) {
                            var location = await geocoder.reverse({lat:resUser.CurrentTrip.getcurentlocation[0], lon:resUser.CurrentTrip.getcurentlocation[1]})
                            resUser.CurrentTrip.getcurentlocation = location[0].formattedAddress;
                        }
                    resolve(resUser.CurrentTrip);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });

}


const fetchFutureTrips = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const futureTripQuery = `SELECT Fut_trip.trip_id , Fut_trip.drop_pick,Fut_trip.trip_date, Fut_trip.timing, (SELECT getLocation('${userUSN}',Fut_trip.trip_id))
                            FROM Fut_trip
                            WHERE Fut_trip.trip_id NOT IN (
                            SELECT Cancel_trip.trip_id FROM Cancel_trip
                            INNER JOIN USN_UID ON Cancel_trip.UID = USN_UID.UID
                            WHERE USN_UID.USN = '${userUSN}') AND Fut_trip.trip_id NOT IN (SELECT trip_id FROM trip) 
                            ORDER BY Fut_trip.trip_id
                            limit 10;`;
    return new Promise((resolve, reject) => {
        clientTrip.connect()
        .then(() => 
            clientTrip.query(futureTripQuery)
                .then(res => {
                        resUser.futureTrips = [];
                        res.rows.forEach(row => {
                            resUser.futureTrips.push(row);
                            var tripIndex = resUser.futureTrips.indexOf(row);
                            resUser.futureTrips[tripIndex].getlocation = resUser.futureTrips[tripIndex].getlocation.slice(1,-1).split(',');
                        });
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(async () => {
                    var geocoder = NodeGeocoder(options);
                    for(var tripIndex=0; tripIndex < resUser.futureTrips.length; tripIndex++) {
                        if(resUser.futureTrips[tripIndex].getlocation[0] != '') {
                            var location = await geocoder.reverse({lat:resUser.futureTrips[tripIndex].getlocation[0], lon:resUser.futureTrips[tripIndex].getlocation[1]})
                                resUser.futureTrips[tripIndex].getlocation = location[0].formattedAddress;
                        }
                    }
                    resolve(resUser.futureTrips);
                    clientTrip.end();
                })
        )
        .catch(err => {
            reject(err);
            console.log(`Connection error: ${err}`);
        });
    });
}

// Or using SMTP Pool if you need to send a large amount of emails
const smtpPool = require('nodemailer-smtp-pool');
const nodemailer = require('nodemailer');
/**
 * Sends mail(password) to the given user mail account
 * @param {*} user 
 */
const sendMail = (user) => {
      var transporter = nodemailer.createTransport(smtpPool({
        service: 'gmail',
        auth: {
            user: 'testpesub4@gmail.com',
            pass: process.env.NODE_PASSWORD
        },
        maxConnections: 5,
        maxMessages: 10
      }));
      var mailOptions = {
        from: 'testpesub4@gmail.com', 
        to: user.email,
        subject: 'Password Reset Request - TMS App',
        text: `Dear ${user.name} \n\n   Your password is ${user.password}. \n\n If you did not make this request, it is likely that another user has entered your USN by mistake and your account is still secure. \n\n Thanks & Regards,\n Team TMS`
      };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });  
}

/**
 * Checks the availability of the USN during registration
 * @param {} usn 
 * @returns Promise<boolean> 
 */
const sendEmail =  (usn) => {
    var mailSent = false;
    const client = new pg.Client(config);
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
                client.query(`SELECT name, Email, password FROM stu_per_data WHERE usn='${usn}';`)
                    .then( res => {
                        res.rows.forEach(row => {
                            sendMail(row);
                            mailSent = true;
                        });
                    })
                    .catch(err => {
                        console.log(`Fetch error: ${err}`);
                        reject(err);
                    })
                    .then(() => {
                        client.end();
                        resolve(mailSent);
                    });
            })
            .catch(err => {
                console.log(`Connection error: ${err}`);
                reject(err);
            });
    });
}

/**
 * Checks the availability of the USN during registration
 * @param user
 * @returns Promise<object> 
 */
const validateLogin =  (user) => {
    var resUser ={};
    return new Promise((resolve, reject) => {
        if(user.id == 'admin') {
            if(user.AId == 'admin' && user.pass == 'admin') {
                resUser = {id: user.id, validAdmin:true};
                resolve(resUser);
            }
            else {
                resolve(null);
            }
        }
        else {
            const client = new pg.Client(config);
            client.connect()
                .then(() => {
                    var userQuery;
                    var response;
                    if(user.id == 'student') {
                        userQuery = `SELECT name FROM stu_per_data WHERE usn='${user.usn}'AND password='${user.pass}';`;
                        response = 'name';
                        resUser = {id: user.id, usn: user.usn};
                    }
                    else if(user.id == 'driver') {
                        userQuery = `SELECT driver_name FROM driver WHERE driver_id='${user.dId}' AND password='${user.pass}';`;
                        response = 'driver_name';
                        resUser = {id:user.id, dId:user.dId};
                    }   
                    client.query(userQuery)
                        .then( res => {
                                console.log(res.rowCount);
                                if(res.rowCount == 0) {
                                    resolve(null);
                                }
                                else {
                                    res.rows.forEach(async(row) => {
                                        resUser.name = row[response];
                                        resUser.futureTrips = [];
                                        if(resUser.id == 'student'){
                                            resUser.CurrentTrip = await fetchCurrentTrips(resUser.usn);
                                            fetchFutureTrips(resUser.usn).then(futureTrips => {
                                                resUser.futureTrips = futureTrips;
                                            resolve(resUser);
                                        });
                                    }
                                    else if(resUser.id == 'driver'){
                                        fetchDriverTrips(resUser.dId).then(driverTrips =>{
                                            resUser.driverTrips=driverTrips;
                                            resolve(resUser);
                                        });
                                    }
                                    });
                                }
                        })
                        .catch(err => {
                            console.log(`Fetch error: ${err}`);
                            reject(err);
                        })
                        .then(() => {
                            client.end();
                        });
                })
                .catch(err => {
                    console.log(`Connection error: ${err}`);
                    reject(err);
                });
        }
    });
}

module.exports = { sendEmail, validateLogin };
