const express = require('express')
const { check } = require('express-validator')// Express validator 
const { isSignedIn, isAuthenticated } = require('../controlers/auth')//Authincators
const { getUserById } = require('../controlers/user')
const { getPostById,createPost,getPost,removePost,getAllPost,likePost,commentPost , getPostByUserId, checkPostLiked} = require('../controlers/post')

const router = express.Router()

//***Param for getting post by id ****/
router.param('postId',getPostById)

//***Param for getting user by id ****/
router.param('userId',getUserById)

//**** Getting All posts in arrey *****/
router.post('/post/all',isSignedIn,getAllPost)

//**** Getting Post by id *****/
router.get('/post/:postId',isSignedIn,getPost)

//*****Getting All post by userId ****/
router.post('/post/allpost/:searchUserId',isSignedIn,getPostByUserId)

//**** Creating post by using user id *****/
router.post('/post/:userId',[
    check('post').isLength({min:3}).withMessage('Post is required')
],isSignedIn,isAuthenticated,createPost)

//**** Deleting post  *****/
router.delete('/post/:postId/:userId',isSignedIn,isAuthenticated,removePost)

/*//Warning 
    We have not created Edit post here 
    So it will not voilent any Policies
*/

//*****Checking is post liked or not */
router.post('/post/liked/:postId',isSignedIn,checkPostLiked)

//Liking Post Route
router.post('/post/like/:postId/:userId',isSignedIn,likePost)

//Commenting Post Route
router.post('/post/comment/:postId',isSignedIn,commentPost)


//Exporting router
module.exports = router