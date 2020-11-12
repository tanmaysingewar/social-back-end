const express = require('express')
const { isSignedIn, isAuthenticated } = require('../controlers/auth')
const router = express.Router()
const {getUserById, getUser, updateUser,serchUser, removeUser,checkUsername} =require('../controlers/user')

router.param('userId',getUserById)

//Get users by ID
router.post('/user/:userId',isSignedIn,getUser)

//Update User
router.put('/user/:userId',isSignedIn,isAuthenticated,updateUser)

//Find search term
router.get('/users/:serchTerm',serchUser)

//Delete user
router.delete('/user/:userId',isSignedIn,isAuthenticated,removeUser)

//Check username avaliblity
router.post('/user/check/username',checkUsername)

//Exporting router
module.exports = router