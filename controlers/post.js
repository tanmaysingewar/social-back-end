const Post = require('../modals/post')//importing Post module
const User = require('../modals/user')//importing User module

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
    if(post.length > 1000){
        return res.json({
            error : 'POST is to long'
        })
    }
    if(postTitle.length > 25){
        return res.json({
            error : 'POST Title is to long'
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
        if (err || !post ) {
            return res.json({
                error : 'post not save in DB'
            })
        }
        return res.json({
            post : true
        })
    })
}


//*** Getting all post */
exports.getAllPost = (req,res)=>{
    let sortBy = req.query.sort ? req.query.sort : "likes.count"
    const skip = parseInt(req.query.skip)  || 0
    const limit = parseInt(req.query.limit) || 6
    Post.find()
    .skip(skip)
    .limit(limit)
    .populate('author','_id name username verified')//populating User name username
    .select('-updatedAt -__v -likes.username -comments.comment')
    .sort([[sortBy ,'desc']])
    .exec((err,post)=>{
        if (err || !post) {
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
    .populate('author','_id name username verified')//populating User name username
    .select('-createdAt -updatedAt -comments')
    .exec((err,post)=>{
        if (err || !post) {
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
        if (err || !post) {
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
        if (err || !post) {
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
            if (err || !post) {
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
        if (err || !post) {
            return res.json({
                error : 'Not able to find Post'
            })
        }
        if (req.body.comment.length < 1) {
            return res.json()
        }
        post.comments.comment.push({
            commentText : req.body.comment,
            username : _uid
        })
        post.comments.count = post.comments.count + 1
        post.save((err,post)=>{
            if (err || !post) {
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
    const skip = parseInt(req.query.skip)  || 0
    const limit = parseInt(req.query.limit) || 3
    Post.find({author : _uid})
    .skip(skip)
    .limit(limit)
    .select('-comments.comment -updatedAt -__v -likes.username')
    .sort([[sortBy ,'desc']])
    .populate('author','username verified')
    .exec((err,posts)=>{
        if (err || !posts) {
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
        if (err || !post) {
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

exports.getCounts = (req,res)=>{
    const _uid = req.profile._id
    Post.find({author : _uid})
    .exec((err, post)=>{
        if (err || !post) {
            return res.json(400).json({
                err: 'No posts found!!!'
            })
        }
        let posts = post.length
        res.json({
            posts
        })
    })
}

exports.getSavedPost = (req,res) =>{
    const _uid = req.profile._id
    let skip = parseInt(req.query.skip)  || 0
    let limit = parseInt(req.query.limit) || 3
    User.findById({_id: _uid})
    .populate({
        path : 'saved.postId',
        select : '-comments.comment -likes.username -__v',
        populate : {
            path : 'author',
            select : 'username verified'
        }
    })
        .exec((err, user)=>{
            if (err || !user) {
                return res.json(400).json({
                    err: 'No user found!!!'
                })
            }
           
            limit = limit + skip
            console.log(skip, limit)
            const savedPost = user.saved.postId.slice(skip, limit );
            console.log(savedPost.length)
            
            res.json({
                savedPost
            })
        })
}

exports.getAllComments = (req,res)=>{
    const _pid = req.post._id
    Post.findById({ _id : _pid})
    .populate('comments.comment.username author', 'username _id verified')
    .select('-likes.username -updatedAt -__v')
    .exec((err, post)=>{
        if(err || !post){
           return res.status(400).json({ 
                error : 'Post Not found !!!'
            })
        }
       res.json({
           post
       })
    })
}

exports.getPostsByLimiting = (req,res)=>{
    const skip = parseInt(req.query.skip)  || 0
    const limit = parseInt(req.query.limit) || 3
    Post.find()
    .skip(skip)
    .limit(limit)
    .exec((err, post)=>{
        if(err || !post){
           return res.status(400).json({
                err : 'Post cant found!!!'
            })
        }
        res.json({post})
    })
}

exports.cardColors =(req,res)=>{
    let colors = [
        'linear-gradient(to right, #2980b9, #6dd5fa, #6dd5fa)',
        'linear-gradient(to right, #ff0099, #493240)',
        'linear-gradient(to right, #1f4037, #99f2c8)',
        'linear-gradient(to right, #f953c6, #b91d73)',
        'linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)',
        'linear-gradient(to right, #8360c3, #2ebf91)',
        'linear-gradient(to right, #009fff, #ec2f4b)',
        'linear-gradient(to right, #348f50, #56b4d3)',
        'linear-gradient(to right, #654ea3, #eaafc8)',
        'linear-gradient(to right, #a8ff78, #78ffd6)',
        'linear-gradient(to right, #fdc830, #f37335)',
        'linear-gradient(to right, #ad5389, #3c1053)',
        'linear-gradient(to right, #da22ff, #9733ee)',
        'linear-gradient(to right, #02aab0, #00cdac)',
        'linear-gradient(to right, #00b09b, #96c93d)',
        'linear-gradient(to right, #fc4a1a, #f7b733)',
        'linear-gradient(to right, #007991, #78ffd6)',
        'white',
        'linear-gradient(to right, #eb5757, #000000)'
    ]

    res.json(colors)
}