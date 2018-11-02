const express = require('express');
const loginRouter = express.Router();
const validateLogin = require('../controllers/login');

/**
 * Router to handle login request
 * Request parameters => USN and Password
 * Response parameters => { user:name }
 */
loginRouter.post('/login/:id', (req, res, next) => {
    validateLogin(req.body)
    .then(responseUser => {
        if(responseUser.name) {
            if(req.params.id=="student") {
                res.render('UserProfile.html',{
                user:responseUser
                })
            }
            else if(req.params.id=="driver") {
                res.render('driver/driverui.html',{
                user:responseUser
                })
            }
        }
        else if(req.params.id=='admin') {
            res.render('admin/adminui.html')
        }
        else {
            exist= false;
            res.send(exist).status(204);
        }
    })
    .catch(err => console.log(err));
});

module.exports = loginRouter ;