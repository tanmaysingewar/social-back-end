const mongoose = require('mongoose')
const { Schema} = mongoose
const { ObjectId } = mongoose.Schema

const postScmema = new Schema({
    post : {
        type: String,
        trim: true,
        required: true,
        maxlength:1000
    },
    postTitle :{
        type: String,
        trim: true,
        maxlength: 20
    },
    color:{
        textColor:{
            type: String,
            trim: true,
            default: 'black',
            required: true
        },
        cardColor:{
            type: String,
            trim: true,
            required: true,
            default :'white'
        }
    },
    author:{
        type : ObjectId,
        ref: 'User',
        required: true
    },
    comments : {
        count : {
            type : Number,
            default : 0
        },
        comment:[{
        commentText: {
            type: String,
            trim:true,
            required: true,
            maxlength: 50,
            require : true
        },
        username: {
            type: ObjectId,
            ref: 'User',
            required :true
        }
    }]},
    likes : {
        count : {
            type : Number,
            default : 0
        },
        username:[{
            type : ObjectId,
            ref: 'User',
            required: true
        }]
    }
},{
    timestamps : true
})

module.exports = mongoose.model('Post',postScmema)