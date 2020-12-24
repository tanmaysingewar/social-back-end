const Post = require("../modals/post")
const User = require("../modals/user")

exports.homealgo = (req,res) =>{
    let sortBy = req.query.sort ? req.query.sort : "_id"
    const skip = parseInt(req.query.skip)  || 0
    const limit = parseInt(req.query.limit) || 3
    const _uid = req.auth._id
    console.log(_uid)
    User.findById({_id : _uid})
    .exec((err, user) =>{
        if(err || !user){
            return res.status(400).json({
                error : 'User not found'
            })
        }
        
        var all = [...user.joines.userId, _uid]
        console.log(all, 'joines')
        Post.find({author: all })
        .skip(skip)
        .limit(limit)
        .populate('author','_id name username verified')//populating User name username
        .sort([[sortBy ,'desc']])
        .exec((err, data) =>{
            if (err || !data) {
                return res.json({
                    error : 'post not save in DB'
                })
            }
            res.json({data})
        })
    })
}