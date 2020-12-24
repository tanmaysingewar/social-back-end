const mongoose = require('mongoose')
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const userSchema = new Schema({
    name:{
        type : String,
        trim : true,
        required: true,
        maxlength:32
    },
    email:{
        type : String,
        trim : true,
        required: true,
        maxlength:40,
        unique:true
    },
    username:{
        type : String,
        unique: true,
        trim : true,
        required: true,
        maxlength: 25
    },
    ency_password:{
        type: String,
        required:true
    },
    salt : {
        type: String,
        required :true,
        unique : true
    },
    conform_id : {
        type : String,
        required : true,
        default : false
    },
    verified:{
        type: Boolean,
        default: false,
        required: true
    }
    ,
    joines:{count :{
        type : Number,
        default : 0
    },
        userId : [{
            type : ObjectId,
            ref : 'User',
            default : [],
            trim : true
        }]
    },
    joined:{count :{
        type : Number,
        default : 0
    },
        userId : [{
            type : ObjectId,
            ref : 'User',
            default : [],
            trim : true
        }]
    },
    description:{
        type: String,
        default : 'Hey nice to see you here',
        trim: true,
        maxlength: 40
    },
    color:{
        textColor:{
            type: String,
            trim: true,
            default: ''
        },
        cardColor:{
            type: String,
            trim: true,
            default :''
        }
    },
    saved:{
        postId :[{
        type : ObjectId,
        ref : 'Post',
        required: true
    }]}
},{
    timestamps :true
})

userSchema.virtual('password')
    .set(function(password){
        this._password = password
        this.salt = uuidv4();
        this.ency_password = this.securePassword(password)
    })
    .get(function(){
        return this._password
    })

userSchema.methods = {
    authincate:function(plainpassword){
        return this.securePassword(plainpassword) === this.ency_password
    },
    securePassword : function(password){
        if (!password) {
            return ''
        }
        try{
            return crypto.createHmac(process.env.PASSWORD_SHA, this.salt)
            .update(password)
            .digest(process.env.PASSWORD_DIGEST);
        }catch(e){
            return ''
        }
    }
}

module.exports = mongoose.model('User',userSchema)