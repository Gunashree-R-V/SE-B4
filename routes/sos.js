const express = require('express');
const sosRouter = express.Router();

sosRouter.get('/sos', (req, res, next) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID ;
    const authToken = process.env.TWILIO_AUTH_TOKEN ;
    const client = require('twilio')(accountSid, authToken);

    client.messages
    .create({
        body: `Emergency required for USN : ${req.query.usn}.\nPlease inform police to look into it.\nPickUp Location : ${req.query.pickUp}.\nDrop Location : ${req.query.drop}\n Route number will be updated shortly`,
        from: process.env.TWILIO_PHONE_NO,
        to: process.env.TWILIO_ADMIN
    })
    .then(message => {
        console.log(message.sid)
        res.send().status(200);
    })
    .catch(err => {
        res.send(err).status(400);
    })
    .done();
});


module.exports = sosRouter ;