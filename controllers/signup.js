const pg = require('pg');
const config = require('../config');

/**
 * Checks the availability of the USN during registration
 * @param {} usn 
 * @returns Promise<boolean> 
 */
const doesUSNExist =  (usn) => {
    var usnExist = false;
    const client = new pg.Client(config);
    return new Promise((resolve, reject) => {
        client.connect()
            .then(() => {
                client.query(`SELECT name FROM stu_per_data WHERE usn='${usn}';`)
                    .then( res => {
                        res.rows.forEach(row => {
                            usnExist = true;
                        });
                    })
                    .catch(err => {
                        console.log(`Fetch error: ${err}`);
                        reject(err);
                    })
                    .then(() => {
                        client.end();
                        resolve(usnExist)
                    });
            })
            .catch(err => {
                console.log(`Connection error: ${err}`);
                reject(err);
            });
    });
}

/**
 * Function to generate Random Password
 * @param {Length of the password with maximum 10} length
 * @returns String
 */
const generatePassword = (length) => { 
    const randomstring = Math.random().toString(36).slice(-length); 
    return randomstring
}

/**
 * Insert student details into database while registration
 * @param {} user
 * @returns Promise<boolean>
 */
const addStudent = (user) => {
    const client = new pg.Client(config);
    var addedStudent = false;
    return new Promise((resolve, reject) => {
        client.connect()
        .then(() => {
            client.query(`INSERT INTO Stu_Per_Data (USN ,Name,Email, Parent_name, Par_Mobile_No, Mobile_No, latitude, longitude,password)
            VALUES ('${user.usn}','${user.name}', '${user.email}', '${user.parentName}', '${user.parentContact}', '${user.contact}',${user.latitude}, ${user.longitude}, '${generatePassword(8)}');`)
                .then(() => {
                        addedStudent = true;
                        client.end();
                        resolve(addedStudent);
                })
                .catch(err => {
                    console.log(`Insertion error: ${err}`);
                    reject(err);
                });
        })
        .catch(err => {
            console.log(`Connection error: ${err}`);
            reject(err);
        });
    });
}

module.exports = { doesUSNExist, addStudent };