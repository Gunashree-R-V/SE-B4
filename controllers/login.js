const pg = require('pg');
const config = require('../config');

var resUser = {};

const fetchFutureTrips = (userUSN) => {
    const clientTrip = new pg.Client(config);
    const futureTripQuery = `SELECT Fut_trip.trip_id , Fut_trip.drop_pick,Fut_trip.trip_date, Fut_trip.timing
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
                        });
                })
                .catch(err => {
                    reject(err);
                    console.log(`Fetch error: ${err}`);
                })
                .then(() => {
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

module.exports = validateLogin;