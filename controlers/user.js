const User = require('../modals/user')

//***** Parem controller *****/
exports.getUserById = (req,res,next,id)=>{
    User.findById(id)
    .select('-joines.userId -joined.userId')
    .exec((err,user)=>{
        if (err|| !user) {
            return res.status(400).json({
                error: 'No user found in DB!!'
            })
        }
        req.profile = user
        next()
    })
}
///***** Geting user by id *****//
exports.getUser = (req,res)=>{
    const { _id, name, username, email, posts, joines, joined , description,verified,color} = req.profile
     
        return res.json({
            _id, name, username, email, description, posts, joines, joined,verified , color
        })
}
//*****Serching User by text ******//
//Searching Users conditionally --- First by username and then by name
exports.serchUser = (req,res)=>{
    console.log('serch routed heated')
    //Extracting serch term
    const search = req.params.serchTerm
    //Serching searchTerm in username
    const username =  User.find({ username : {$regex: search,$options: 'i'} },'name username _id verified')
    username.exec((err,data)=>{
        if (err || !data) {
            return res.status(400).json({
                error : 'Something went worg'
            })
        }
        //On no reasult then cheaking names
        if (!data[0]) {
          return User.find({ name: {$regex: search,$options: 'i'} },'name username _id verified')
            .exec((err,data)=>{
                if (err || !data) {
                    return res.status(400).json({
                        error : 'Something went worg'
                        }) 
                }
                if(!data[0]){
                    return res.json({
                        msg : 'No search Found'
                        }) 
                }
                return res.json({
                        msg : 'Search related to search term',
                        searchBy: 'Name',
                        data
                })
                })
            }
            return res.json({
                msg : 'Search related to search term',
                searchBy: 'Username',
                data
        })
    })
}
//***** Updating user *******//
exports.updateUser = (req,res)=>{
    const { color , name ,email ,username,description } = req.body
    User.findByIdAndUpdate(
        {_id : req.profile._id},
        {$set: { color , name ,email ,username, description }},
        {new: true,useFindAndModify: false},
        (err, user)=>{
            if (err || !user) {
                if (err.keyValue.username) {
                    return res.status(400).json({
                        error : `${err.keyValue.username} is already exist`
                    })
                }
                if (err.keyValue.email) {
                    return res.status(400).json({
                        error : `${err.keyValue.email} is already exist`
                    })
                }
                return res.status(400).json({
                    error: 'Not able to update in Db'
                })
            }
            //Extracting values from -->'user'
            const { _id } = user
            res.json({_id})
        }
    )
}
//**** Remove User *****/
exports.removeUser = (req,res)=>{
    const id = req.profile._id
    req.profile.remove({_id : id},((err,user)=>{
        if (err || !user) {
            return res.json({
                error: 'Something went wrong'
            })
        }
        //Extracting values from -->'user'
        const { _id} = user
        return res.json({_id})
         
    }))
}
///*****Check usename avaliblit ********/
exports.checkUsername = (req,res)=>{
    User.find({username : req.body.username})
    .exec((err,data)=>{
        if (err || !data) {
            return res.status(400).json({
                error : 'Something went worg'
                }) 
        }
        if (data[0]) {
            return res.json({
                msg : `${data[0].username}`,
                _id : data[0]._id
            })
        }
        return res.json({
            msg : 'avaliable'
        })
    })
}
exports.savePost = (req,res)=>{
    const _pid = req.post._id
    const _uid = req.profile._id
    const x = req.params.postId
    User.findById({ _id : _uid})
    .exec((err, user)=>{
        if (err || !user) {
            return res.status(400).json({
                err : 'No user found!!',
                error : err
            })
        }
        if (user.saved.postId.includes(_pid)) {
            
            user.saved.postId.remove(_pid)
            user.save((err,user)=>{
                if (err || !user) {
                    return res.json({
                        error : 'Not able to Save Comment'
                    })
                }
                return res.json({user})
                })
        }else{
            user.saved.postId.push(_pid)
            user.save((err,user)=>{
                if (err || !user) {
                    return res.json({
                        error : 'Not able to Save Comment'
                    })
                }
                return res.json({user})
                })
        }
    })
}
exports.isPostSaved = (req,res)=>{
    const _pid = req.post._id
    const _uid = req.profile._id
    User.findById({ _id : _uid})
    .exec((err, user)=>{
        if (err || !user) {
            return res.status(400).json({
                err : 'No user found!!',
                error : err
            })
        }
        if (user.saved.postId.includes(_pid)) {
            res.json({
                msg : 'saved'
            })
        }else{
            res.json({
                msg : 'unsaved'
            })
        }
    })
}
exports.joinUser = (req,res)=>{
    const _juid = req.profile._id //userId where user want to join **** ---Host 
    const _uid = req.auth._id //userId of user *** ---Bacteria

    if(_uid == _juid){
        return res.json({
            msg : 'you cant join yourself'
        })
    }else{
        console.log(_uid == _juid)
        User.findById({_id : _juid})
        .exec((err,user) =>{
            if(err || !user){
                res.status(400).json({
                    err : 'User Not found'
                })
            }
            if(user.joined.userId.includes(_uid)){
                user.joined.userId.remove(_uid)
                user.joined.count = user.joined.count - 1 
                user.save((err ,user)=>{
                    if(err || !user){
                        return res.status(400).json({
                              err : 'User cant saved'
                          })
                      }
                      User.findById({_id : _uid})
                      .exec((err,user)=>{
                        if(err || !user){
                           return res.status(400).json({
                                  err : 'User cant saved'
                              })
                          }
                          user.joines.userId.remove(_juid)
                          user.joines.count = user.joines.count - 1 
                          user.save((err,user)=>{
                            if(err || !user){
                               return res.status(400).json({
                                      err : 'User cant saved'
                                  })
                              }
                              res.json({
                                msg : false
                            })
                          })
                      }) 
                })
              
            }else{
                user.joined.userId.push(_uid)
                user.joined.count = user.joined.count + 1 
                user.save((err,user)=>{
                if(err || !user){
                    return res.status(400).json({
                        err : 'User cant saved'
                    })
                }
                User.findById({_id : _uid})
                .exec((err,user)=>{
                  if(err || !user){
                     return res.status(400).json({
                            err : 'User cant saved'
                        })
                    }
                    user.joines.userId.push(_juid)
                    user.joines.count = user.joines.count + 1 
                    user.save((err,user)=>{
                      if(err || !user){
                         return res.status(400).json({
                                err : 'User cant saved'
                            })
                        }
                        res.json({
                            msg : true
                        })
                    })
                }) 
                
            })
        }   
        })
    }
}

exports.isjoinUser = (req,res)=>{
    const _juid = req.profile._id //userId where user want to join **** ---Host 
    const _uid = req.auth._id //userId of user *** ---Bacteria

    User.findById({_id : _juid})
        .exec((err,user) =>{
            if(err || !user){
                res.status(400).json({
                    err : 'User Not found'
                })
            }
            
            if(user.joined.userId.includes(_uid)){
                res.json({
                    msg : true
                })
              
            }else{
                
            res.json({
                msg : false
            })
            }
            
        })
}

exports.topUser = (req,res) => {
    const _uid = req.auth._id
    const limit = parseInt(req.query.limit) || 3
    User.find()
    .select('username name verified')
    .sort([[ 'joined' ,-1]])
    .limit(limit)
    .exec((err,user)=>{
        if(err || !user) return res.status(400).json({
            error : 'User not found'
        })
        console.log(user)
        res.json({
            user
        })

    })
}