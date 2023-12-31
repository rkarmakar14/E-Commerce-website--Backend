import mongoose, { now } from "mongoose";
import AuthRoles from "../utilities/user.role";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "../config";
import crypto from "crypto"

const userSchema = mongoose.Schema(
    {
    name:{
        type:String,
        reuqired: [true, "Name is required"],
        maxLength: [50, "maximum length should be 50"]
    },
    email:{
        type:String,
        required: [true, "email id is required"],
        unique: true
    },
    password:{
        type:String,
        required: [true, "Password is required"],
        minLength: [8, " Password should be 8 chararcter minimum"],
        // password should be given to frontend 
        select: false
    },
    role:{
        type: String,
        //getting the roles as and array
        enum: Object.values(AuthRoles),
        // the default value is given beacuse it will auto select the user role
        default: AuthRoles.USER,
    },
    passwordForgettenToken: String,
    passwordForgettenExpiry: Date,
    },
    // adding cretedAt and updateAt two properties to the schema
    {
        timestamps: true 
    }
)

// emcrypt the password before saving it to database
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
})
// adding features/methods directly to schema
// compare the password
userSchema.methods = {
    comparePassword: function(enteredPassword){
        bcrypt.compare(enteredPassword, this.password)
    },
//generate JWToken
    generateJwtToken : function(){
        jwt.sign(
            {
                _id:_this._id,
                name:this.name,
                email: this.email
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRY
            }
        )
    },
    // generate forget password token
    generateForgetPasswordToken : function(){
        const forgetToken = crypto.randomBytes (16).toString ("hex")

     // save to DB
    this.generateForgetPasswordToken = crypto.createHmac('sha512')
     .update(forgetToken)
     .digest("hex");
    
     this.passwordForgettenExpiry = Date.now() + 20 * 60 * 1000

     // return this value to user
     return forgetToken;
    }

}

export default mongoose.Schema("Users",userSchema);

