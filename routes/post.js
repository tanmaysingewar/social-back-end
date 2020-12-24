const express = require('express')
const { check } = require('express-validator')// Express validator 
const { isSignedIn, isAuthenticated, isConformend } = require('../controlers/auth')//Authincators
const { getUserById } = require('../controlers/user')
const { getPostById,createPost,getPost,removePost,getAllPost,likePost,cardColors,commentPost,getCounts, getSavedPost , getPostByUserId, checkPostLiked, getAllComments, getPostsByLimiting} = require('../controlers/post')
const { homealgo } = require('../controlers/home')

const router = express.Router()

//***Param for getting post by id ****/
router.param('postId',getPostById)

//***Param for getting user by id ****/
router.param('userId',getUserById)

//**** Getting All posts in arrey *****/
router.post('/post/all',isSignedIn,isConformend,getAllPost)

//**** Getting Post by id *****/
router.get('/post/:postId',isSignedIn,isConformend,getPost)

//*****Getting All post by userId ****/
router.post('/post/allpost/:searchUserId',isSignedIn,isConformend,getPostByUserId)

//**** Creating post by using user id *****/
router.post('/post/:userId',[
    check('post').isLength({min:3}).withMessage('Post is required')
],isSignedIn,isConformend,isAuthenticated,createPost)

//**** Deleting post  *****/
router.delete('/post/:postId/:userId',isSignedIn,isConformend,isAuthenticated,removePost)

/*//Warning 
    We have not created Edit post here 
    So it will not voilent any Policies
*/

//*****Checking is post liked or not */
router.post('/post/liked/:postId',isSignedIn,isConformend,checkPostLiked)

//Liking Post Route
router.post('/post/like/:postId/:userId',isSignedIn,isConformend,likePost)

//Commenting Post Route
router.post('/post/comment/:postId',isSignedIn,isConformend,commentPost)

//Getting counts of posts
router.post('/post/counts/:userId',isSignedIn,isConformend,getCounts)

//Getting counts of Saved posts
router.post('/post/saved/:userId',isSignedIn,isConformend,isAuthenticated,getSavedPost)

//Getting all comments
router.post('/post/all/comments/:postId',isSignedIn,isConformend,getAllComments)


router.post('/posts',isSignedIn,homealgo)

router.get('/card/color',cardColors)

//Exporting router
module.exports = router