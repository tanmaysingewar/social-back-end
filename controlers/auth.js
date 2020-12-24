require('dotenv').config()
const { validationResult } = require("express-validator")//express Validator
const User = require('../modals/user')
const jwt = require('jsonwebtoken')//setting jwt token 
const expressJwt = require('express-jwt')//checking jwt token from client
const otpGenerator = require('otp-generator')


var nodemailer = require('nodemailer');
const user = require("../modals/user")

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.PROJECT_EMAIL,
    name : process.env.PROJECT_EMAIL_NAME,
    pass: process.env.PROJECT_EMAIL_PASSWORD
  }
});

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
    var user = new User(req.body)
    //Saving in DB
    user.save((err, user)=>{
        if (err || !user) {
            console.log(err)
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
          const token = jwt.sign({_id: user._id},process.env.TOKEN_SEC)

          //***** Extracting User ***** //
          const { _id, name,username, email, role , conform_id } = user
  
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
                  role,
                  conform_id
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
        const token = jwt.sign({_id: user._id},process.env.TOKEN_SEC)

        //***** Extracting User ***** //
        const { _id, name,username, email, conform_id } = user

        //****  Setting in Cookie ******//
        res.cookie("token", token, {expire: new Date() + 9999})
        res.cookie("username", username,{expire: new Date() + 9999})

        return res.json({
            token,
            user:{
                _id,
                username,
                name,
                email,
                conform_id
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
    secret: process.env.TOKEN_SEC,
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

exports.isConformend = (req,res,next) =>{
    const _uid = req.auth._id
    User.findById({ _id : _uid})
    .exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error :  "Connecting DB failed"
            })
        }
        const conform = user.conform_id === 'true'
        if(!conform){
            return res.status(403).json({
                error :  "ACCESS DENIDE"
            }) 
        }else{
            next()
        }
    })
    
}

exports.sendOtp = (req,res) =>{
    const _uid = req.auth._id
    User.findById({_id : _uid})
    .exec((err,user) =>{
        if(err || !user){
            return res.status(400).json({
                error : 'User not found'
            })
        }
        const otp =(otpGenerator.generate(4, { upperCase: false, specialChars: false , alphabets : false }))

        console.log(otp)
        console.log(user)
        user.conform_id = otp

        user.save()

        var mailOptions = {
            from: '"Ficktree" singewartanmay@gmail.com',
            to: user.email,
            subject: 'Your OTP of Ficktree',
            text: `Your Otp is ${user.conform_id}`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });

        

        res.json({
            status : 'send'
        })
    })
}


exports.conformId = (req,res) =>{
    const _uid = req.auth._id
    const otp = req.query.otp
    User.findById({_id : _uid})
    .exec((err,user) =>{
        if(err || !user){
            return res.status(400).json({
                error : 'User not found'
            })
        }
        const match = user.conform_id === otp
        if(!match){
           return res.json({
                match : false
            })
        }
        user.conform_id = true

        user.save()

         //Creating Token
         const token = jwt.sign({_id: user._id},'tanmaysecrtishere')

         //***** Extracting User ***** //
         const { _id, name,username, email, conform_id } = user
 
         //****  Setting in Cookie ******//
         res.cookie("token", token, {expire: new Date() + 9999})
         res.cookie("username", username,{expire: new Date() + 9999})
 
         return res.json({
            match : true,
             token,
             user:{
                 _id,
                 username,
                 name,
                 email,
                 conform_id
             }
         })
    })
}

