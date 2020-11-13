const { json } = require('body-parser')
const { stringify } = require('uuid')
const post = require('../modals/post')
const Post = require('../modals/post')//importing Post module

//Param
//*** Getting Post and cheaking existance by id --->(Param) */
exports.getPostById = (req,res,next,id)=>{
    Post.findById(id).exec((err,post)=>{
        if (err || !post) {
            return res.status(400).json({
                error: 'No id find in DB'
            })
        }
        req.post = post
        next()
    })
}


//CRUD controllers  
///****Creating Post --> C */
exports.createPost = (req,res)=>{
    const { postTitle,post, color } = req.body
    const _id = req.profile._id
    //Cheaking POST
    if (!post) {
        return res.json({
            error : 'POST is require'
        })
    }
    //setting new POST
    const newpost = new Post({
        post,
        postTitle ,
        author : _id,
        color
    })
    //saving Post
    newpost.save((err,post)=>{
        if (err) {
            return res.json({
                error : 'post not save in DB'
            })
        }
        return res.json({
            post
        })
    })
}


//*** Getting all post */
exports.getAllPost = (req,res)=>{
    let sortBy = req.query.sort ? req.query.sort : "_id"
    Post.find()
    .populate('author','_id name username')//populating User name username
    .select('-updatedAt -__v')
    .sort([[sortBy ,'desc']])
    .exec((err,post)=>{
        if (err) {
            return res.json({
                error : 'post not save in DB'
            })
        }
        res.json({post})
    })
}

//**** Getting Post by Id ****/
exports.getPost = (req,res)=>{
    
    //Getting post _id 
    const _id = req.post._id

    //finding POST by id
    Post.find(_id)
    .populate('author','_id name username')//populating User name username
    .select('-createdAt -updatedAt -comments')
    .exec((err,post)=>{
        if (err) {
            return res.json({
                error : 'post not save in DB'
            })
        }
        res.json({post})
    })
}

//**** Removing Post ****/
exports.removePost = (req,res)=>{
    req.post.remove((err,post)=>{
        if (err) {
            return res.json({
                error : 'Not able to delete Post'
            })
        }
        res.json({
            msg: 'Post has been removed',
            post
        })
    })
}

//**** Liking Post ****/
exports.likePost = (req,res)=>{
    const _pid = req.post._id
    const _uid = req.profile._id
    Post.findById({_id : _pid})
    .exec((err,post)=>{
        if (err) {
            return res.json({
                error : 'Not able to find Post'
            })
        }
        if (post.likes.username.includes(_uid)) {
            post.likes.username.splice(_uid)
            post.likes.count = post.likes.count - 1
            post.save((err,post)=>{
                if (err) {
                    return res.json({
                        error : 'Not able to Save Like'
                    })
                }
                return res.json({status : 'disliked'})
            })
        }else{
        post.likes.username.push(_uid)
        post.likes.count = post.likes.count + 1
        post.save((err,post)=>{
            if (err) {
                return res.json({
                    error : 'Not able to Save Like'
                })
            }
            return res.json({status : 'liked'})
            })
        }
    })
}

//**** Commentinging Post ****/
exports.commentPost = (req,res)=>{
    const _pid = req.post._id
    const _uid = req.auth._id
    Post.findById({_id : _pid})
    .exec((err,post)=>{
        if (err) {
            return res.json({
                error : 'Not able to find Post'
            })
        }
        if (req.body.comment.length < 1) {
            return res,json()
        }
        post.comments.comment.push({
            commentText : req.body.comment,
            username : _uid
        })
        post.comments.count = post.comments.count + 1
        post.save((err,post)=>{
            if (err) {
                return res.json({
                    error : 'Not able to Save Comment'
                })
            }
            return res.json({post})
            })
    })
}

exports.getPostByUserId = (req,res) =>{
    const _uid = req.params.searchUserId
    let sortBy = req.query.sort ? req.query.sort : "_id"
    Post.find({author : _uid})
    .select('-comments.comment -updatedAt -__v -likes.username')
    .sort([[sortBy ,'desc']])
    .populate('author','username')
    .exec((err,posts)=>{
        if (err) {
            return res.json({
                error : 'Not able to find Post'
            })
        }
        return res.json(posts)
    })
}

exports.checkPostLiked = (req,res)=>{
    const _pid = req.post._id
    const _uid = req.auth._id
    Post.findById(_pid)
    .exec((err,post)=>{
        if (err) {
            return res.json({
                error : 'Not able to find Post'
            })
        }
        if (post.likes.username.includes(_uid)) {
            res.json({
                liked : true
            })
        }else{
             res.json({
                liked : false
            })
        }
    })
}