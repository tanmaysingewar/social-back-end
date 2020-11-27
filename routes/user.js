const express = require('express')
const { isSignedIn, isAuthenticated } = require('../controlers/auth')
const { getPostById } = require('../controlers/post')
const router = express.Router()
const {getUserById, getUser, updateUser,serchUser, removeUser,isjoinUser,joinUser,checkUsername,savePost,isPostSaved} =require('../controlers/user')

router.param('userId',getUserById)

router.param('postId',getPostById)

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

//Save post 
router.post('/user/save/:postId/:userId',isSignedIn,isAuthenticated,savePost)

//check is saved or not
router.post('/user/check/save/:postId/:userId',isSignedIn,isAuthenticated,isPostSaved)

//Join the user
router.post('/user/join/:userId',isSignedIn,joinUser)

//Is user is joined 
router.post('/user/check/join/:userId',isSignedIn,isjoinUser)


//Exporting router
module.exports = router