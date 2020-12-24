const express = require('express')
const { isSignedIn, isAuthenticated, isConformend } = require('../controlers/auth')
const { getPostById } = require('../controlers/post')
const router = express.Router()
const {getUserById, getUser, updateUser,serchUser, topUser,removeUser,isjoinUser,joinUser,checkUsername,savePost,isPostSaved} =require('../controlers/user')

router.param('userId',getUserById)

router.param('postId',getPostById)

//Get users by ID
router.post('/user/:userId',isSignedIn,isConformend,getUser)

//Update User
router.put('/user/:userId',isSignedIn,isConformend,isAuthenticated,updateUser)

//Find search term
router.get('/users/:serchTerm',serchUser)

//Delete user
router.delete('/user/:userId',isSignedIn,isConformend,isAuthenticated,removeUser)

//Check username avaliblity
router.post('/user/check/username',checkUsername)

//Save post 
router.post('/user/save/:postId/:userId',isSignedIn,isConformend,isAuthenticated,savePost)

//check is saved or not
router.post('/user/check/save/:postId/:userId',isSignedIn,isConformend,isAuthenticated,isPostSaved)

//Join the user
router.post('/user/join/:userId',isSignedIn,isConformend,joinUser)

//Is user is joined 
router.post('/user/check/join/:userId',isSignedIn,isConformend,isjoinUser)

//top users
router.post('/user/top/users',isSignedIn,isConformend,topUser)


//Exporting router
module.exports = router