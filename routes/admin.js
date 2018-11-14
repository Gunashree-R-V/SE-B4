const express = require('express');
const adminRouter = express.Router();


const { approveUser, blockUser ,getUsers, getTrips, getBlockUsers, updateTrips, tripJson } = require('../controllers/admin');

const { sendEmail } = require('../controllers/login');
adminRouter.get('/userList', (req, res, next) => {
    getUsers()
        .then(users => {
            if(users != null){
                res.send(users).status(200);
            }
            else
            {
                exist= false;
                res.send(exist).status(204);
            }
        })
        .catch(err => console.log(err));
});

adminRouter.get('/getTripDetails/:route_no',(req,res,next) =>
{
  console.log("Sent trip number ",req.params.route_no);
  tripJson(req.params.route_no)
  .then(result=>
  {
    console.log(result);
    res.send(result);
  });
});


adminRouter.get('/blockUserList', (req, res, next) => {
    getBlockUsers()
        .then(users => {
            if(users != null){
                res.send(users).status(200);
            }
            else
            {
                exist= false;
                res.send(exist).status(204);
            }
        })
        .catch(err => console.log(err));
});



adminRouter.post('/admin/:id', (req, res, next) => {
    if(req.params.id=="approve")
    {
        approveUser(req.body)
        .then(responseUser => {
            if(responseUser!= null) {
                sendEmail(responseUser)
                .then(sent => {
                })
                .catch(err => console.log(err));
            }
            res.send({func:req.params.id ,Id:responseUser});
        })
        .catch(err => console.log(err));
    }
    if(req.params.id=="block")
    {
        blockUser(req.body)
        .then(responseUser => {
                    res.send({func:req.params.id ,Id:responseUser});
        })
        .catch(err => console.log(err));
    }
});

/**
 * Router to handle login request
 * Request parameters => USN and tripId
 * Response parameters => { user:status }
 */
adminRouter.get('/updateTrips',(req,res,next)=>{
  updateTrips()
    .then(lats =>{
      if(lats != null){
        // res.render('admin/trips.html')
          res.send(lats).status(200);
      }
      else
      {
          exist= false;
          res.send(exist).status(204);
      }
  })
  .catch(err => console.log(err));
});


adminRouter.get('/tripList', (req, res, next) => {
   getTrips()
    .then(trips => {
        if(trips != null){
            // res.render('admin/trips.html')
            res.send(trips).status(200);
        }
        else
        {
            exist= false;
            res.send(exist).status(204);
        }
    })
    .catch(err => console.log(err));
});

module.exports = adminRouter ;
