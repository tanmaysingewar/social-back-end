const User = require('../modals/user')
const mongoose = require('mongoose')

//***** Parem controller *****/
exports.getUserById = (req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
        if (err|| !user) {
            return res.status(400).json({
                error: 'No user found in DB'
            })
        }
        req.profile = user
        next()
    })
}

///***** Geting user by id *****//
exports.getUser = (req,res)=>{
    console.log(req.profile)
    const { _id, name, username, email, posts, description, joines, joined ,color} = req.profile
     
        return res.json({
            _id, name, username, email, description, posts, joines, joined , color
        })
}

//*****Serching User by text ******//
//Searching Users conditionally --- First by username and then by name
exports.serchUser = (req,res)=>{
    //Extracting serch term
    const search = req.params.serchTerm
    //Serching searchTerm in username
    const username =  User.find({ username : {$regex: search,$options: 'i'} },'name username _id')
    username.exec((err,data)=>{
        if (err) {
            return res.status(400).json({
                error : 'Something went worg'
            })
        }
        //On no reasult then cheaking names
        if (!data[0]) {
          return User.find({ name: {$regex: search,$options: 'i'} },'name username _id')
            .exec((err,data)=>{
                if (err) {
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
    console.log(req.profile._id, req.body)
    const { color , name ,email ,username } = req.body
    User.findByIdAndUpdate(
        {_id : req.profile._id},
        {$set: { color , name ,email ,username }},
        {new: true,useFindAndModify: false},
        (err, user)=>{
            if (err) {
                console.log(err.keyValue)
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
            const { _id, name, username, email, posts, description, joines, joined} = user
            res.json({_id, name, username, email, posts, description, joines, joined})
        }
    )
}
//**** Remove User *****/
exports.removeUser = (req,res)=>{
    const id = req.profile._id
    req.profile.remove({_id : id},((err,user)=>{
        if (err) {
            return res.json({
                error: 'Something went wrong'
            })
        }
        //Extracting values from -->'user'
        const { _id, name, username, email, posts, description, joines, joined} = user
        return res.json({_id, name, username, email, description, posts, joines, joined})
         
    }))
}


///*****Check usename avaliblit ********/
exports.checkUsername = (req,res)=>{
    User.find({username : req.body.username})
    .exec((err,data)=>{
        if (err) {
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