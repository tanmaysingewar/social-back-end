const express = require('express')
const { check } = require('express-validator')
const router = express.Router()
const {singup,singin,singout} = require('../controlers/auth')

router.post('/singup',[
    check('name').isLength({min:3 , max:20}).withMessage('name must be at least 3 characture long'),
    check('username').isLength({min:2 ,max: 20}).withMessage('username is atlest 2 char long'),
    check('email').isEmail().withMessage('Email is required'),
    check('password').isLength({min: 5}).withMessage('Password must be at least 3 chars long')
    .matches(/\d/).withMessage('must contain a number')
],singup)

router.post('/singin',[
    check('email').isEmail().withMessage('Email is required'),
    check('password').isLength({ min: 5}).withMessage('Password must be at least 3 chars long')
],singin)

router.get('/singout',singout)

module.exports = router