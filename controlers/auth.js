const { validationResult } = require("express-validator")//express Validator
const User = require('../modals/user')
const jwt = require('jsonwebtoken')//setting jwt token 
const expressJwt = require('express-jwt')//checking jwt token from client


//Singin controller
exports.singup = (req,res)=>{
    //express valedater cheaker
    const errors = validationResult(req)
    //
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error : errors.array()[0].param,
            msg :errors.array()[0].msg
        })
    }
    //Setting user according to DB
    const user = new User(req.body)
    //Saving in DB
    user.save((err, user)=>{
        if (err) {
            console.log(err.keyPattern)
            // if (err.keyPattern) {
            //     return res.status(402).json({
            //         error : err.keyPattern.username
            //     })
            // }
            return res.status(400).json({
                error : 'Not able to save in DB',
                param : err.keyPattern
            })
        }
          //Creating Token
          const token = jwt.sign({_id: user._id},'tanmaysecrtishere')

          //***** Extracting User ***** //
          const { _id, name,username, email, role } = user
  
          //****  Setting in Cookie ******//
          res.cookie("token", token, {expire: new Date() + 9999})
          res.cookie("username", username,{expire: new Date() + 9999})

          //returning responce to client
          return res.json({
              token,
              user:{
                  _id,
                  username,
                  name,
                  email,
                  role
              }
          })
    })
}

exports.singin = (req,res) =>{
    //Extraction responce
    const {email , password } = req.body

    //Express validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error : errors.array()[0].param,
            msg :errors.array()[0].msg
        })
    }

    /****** Finding User & setting token ********/ 
    User.findOne({email},(err,user)=>{

        //Searching email in DB
        if (err || !user) {
            return res.status(400).json({
                error: "USER email Does not exist"
            })
        }
        //Cheaking password
        if (!user.authincate(password)) {
            return res.status(401).json({
                error : 'Email and password dosent match'
            })
        }

        //Creating Token
        const token = jwt.sign({_id: user._id},'tanmaysecrtishere')

        //***** Extracting User ***** //
        const { _id, name,username, email, role } = user

        //****  Setting in Cookie ******//
        res.cookie("token", token, {expire: new Date() + 9999})
        res.cookie("username", username,{expire: new Date() + 9999})

        return res.json({
            token,
            user:{
                _id,
                username,
                name,
                email
            }
        })
    })
}

//Singout controller
exports.singout = (req,res)=>{
    res.clearCookie('token')
    res.json({
        msg: 'User singout successfully'
    })
}
///

//*****Middlewares *****//
//Cheak  User is SingIn  
exports.isSignedIn = expressJwt({
    secret: 'tanmaysecrtishere',
    userProperty: "auth"
})

//Cheak  User is Authenticated 
exports.isAuthenticated = (req,res,next)=>{
    let checker = req.profile && req.auth && req.profile._id == req.auth._id
    if(!checker){
        return res.status(403).json({
            error: "ACCESS DENIDE"
        })
    }
    next()
}