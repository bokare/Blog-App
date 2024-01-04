const mongoose = require('mongoose')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken') ;

const userSchema = new mongoose.Schema ({
    username : {
        type: String,
        required : true,
        unique:true,
        lowercase : true,
        trim : true,
        index: true
    },
    email : {
        type: String,
        unique:true,
        required : true,
        lowercase : true,
        trim : true,
    },
    fullname : {
        type: String,
        required : true,
        index:true,
        trim : true,
    },
    
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String
    }
},
{

    timestamps:true
}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    console.log("\npassword hashed\n")
    next()
})

// this methods are called on user created models or records not on model Name directly 
userSchema.methods.isPasswordCorrect  = async function(password){
   return await bcrypt.compare(password,this.password)  // here this keyword refers to individual record or model on which this method is called ;
}

userSchema.methods.generateAccessToken = function(){
    console.log("access token - generated")
    return jwt.sign(
        {
            _id: this._id,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRETS,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    console.log("refresh- token - generated")
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRETS,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User",userSchema)
module.exports  = User