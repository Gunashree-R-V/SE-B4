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

const fetchFutureTrips = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const futureTripQuery = `SELECT Fut_trip.trip_id , Fut_trip.drop_pick,Fut_trip.trip_date, Fut_trip.timing, (SELECT getLocation('${userUSN}',Fut_trip.trip_id))
                            FROM Fut_trip
                            WHERE Fut_trip.trip_id NOT IN (
                            SELECT Cancel_trip.trip_id FROM Cancel_trip
                            INNER JOIN USN_UID ON Cancel_trip.UID = USN_UID.UID
                            WHERE USN_UID.USN = '${userUSN}') 
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
                reject(new Error('Authentication failed'));
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
                        userQuery = `SELECT driver_name FROM driver WHERE driver_id=${user.dId} AND password='${user.pass}';`;
                        response = 'driver_name';
                        resUser = {id:user.id, dId:user.dId};
                    }   
                    client.query(userQuery)
                        .then( res => {
                                res.rows.forEach(row => {
                                    resUser.name = row[response];
                                    resUser.futureTrips = [];
                                    if(resUser.id == 'student'){
                                        fetchFutureTrips(resUser.usn).then(futureTrips => {
                                            resUser.futureTrips = futureTrips;
                                            resolve(resUser);
                                        });
                                    }
                                    else if(resUser.id == 'driver'){
                                        resolve(resUser);
                                    }
                                });
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
