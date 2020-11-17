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
        maxlength:32
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
    joines:{
        type : Number,
        default : 0
    },
    joined:{
        type : Number,
        default : 0
    },
    description:{
        type: String,
        default : 'Hey nice to see you here',
        trim: true,
        maxlength: 80
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
    saved : [{
        type : ObjectId,
        ref : 'Post'
    }]
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
            return crypto.createHmac('sha256', this.salt)
            .update(password)
            .digest('hex');
        }catch(e){
            return ''
        }
    }
}

module.exports = mongoose.model('User',userSchema)