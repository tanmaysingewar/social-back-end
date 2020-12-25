require('dotenv').config()
const { validationResult } = require("express-validator")//express Validator
const User = require('../modals/user')
const jwt = require('jsonwebtoken')//setting jwt token 
const expressJwt = require('express-jwt')//checking jwt token from client
const otpGenerator = require('otp-generator')


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.PROJECT_EMAIL_OTP,
    name : process.env.PROJECT_EMAIL_NAME_OTP,
    pass: process.env.PROJECT_EMAIL_PASSWORD_OTP
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

        if(conform_id === "true" ){
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
        }

        return res.json({
            token,
            user:{
                _id,
                username,
                name,
                email,
                conform_id : 'false'
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
            // text: `Your Otp is ${user.conform_id}`
            html : `<html>
            <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1"> 
                          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                            <style type="text/css">
                                @media screen {
                                    @font-face {
                                        font-family: 'Lato';
                                        font-style: normal;
                                        font-weight: 400;
                                        src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                                    }
                        
                                    @font-face {
                                        font-family: 'Lato';
                                        font-style: normal;
                                        font-weight: 700;
                                        src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                                    }
                        
                                    @font-face {
                                        font-family: 'Lato';
                                        font-style: italic;
                                        font-weight: 400;
                                        src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                                    }
                        
                                    @font-face {
                                        font-family: 'Lato';
                                        font-style: italic;
                                        font-weight: 700;
                                        src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                                    }
                                }
                        
                                /* CLIENT-SPECIFIC STYLES */
                                body,
                                table,
                                td,
                                a {
                                    -webkit-text-size-adjust: 100%;
                                    -ms-text-size-adjust: 100%;
                                }
                        
                                table,
                                td {
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                }
                        
                                img {
                                    -ms-interpolation-mode: bicubic;
                                }
                        
                                /* RESET STYLES */
                                img {
                                    border: 0;
                                    height: auto;
                                    line-height: 100%;
                                    outline: none;
                                    text-decoration: none;
                                }
                        
                                table {
                                    border-collapse: collapse !important;
                                }
                        
                                body {
                                    height: 100% !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                }
                        
                                /* iOS BLUE LINKS */
                                a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: none !important;
                                    font-size: inherit !important;
                                    font-family: inherit !important;
                                    font-weight: inherit !important;
                                    line-height: inherit !important;
                                }
                        
                                /* MOBILE STYLES */
                                @media screen and (max-width:600px) {
                                    h1 {
                                        font-size: 32px !important;
                                        line-height: 32px !important;
                                    }
                                }
                        
                                /* ANDROID CENTER FIX */
                                div[style*="margin: 16px 0;"] {
                                    margin: 0 !important;
                                }
                            </style>
                        </head>
                        
                        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
                            <!-- HIDDEN PREHEADER TEXT -->
                            <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- LOGO -->
                                <tr>
                                    <td bgcolor="#FFA73B" align="center">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td bgcolor="#FFA73B" align="center" style="padding: 0px 10px 0px 10px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                                    <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome to Ficktree!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <p style="margin: 0;color : black;  padding: 20px ">Your OTP is <b>${otp}</b> </p>
                                                </td>
                                            </tr> <!-- COPY -->
                                            <tr style="">
                                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <p style="margin: 0;">If that doesn't work, plz directly contact with us !!!</p>
                                                </td>
                                            </tr><!-- COPY -->
                                            
                                            <tr>
                                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <p style="margin: 0;">by Tanmay Singewar<br>~ Tanmay Singewar Production</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                                    <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                                                    <p style="margin: 0;">mail to ficktreecontacts@gmail.com</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                                                    <p style="margin: 0; text-align : center">Happy to see you here</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        
                        </html>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            res.json({
                status : 'send'
            })
            }
        });

        

        
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

