import mongoose, { Error } from "mongoose";
import bcrypt from "bcrypt"

const UserSchema= new mongoose.Schema({
    name : {
        type:mongoose.Schema.Types.String,
        requried:true,
        unique:true,
    },
    email: {
        type:mongoose.Schema.Types.String,
        requried:true,
        unique:true,
    },
    password : {
        type:mongoose.Schema.Types.String,
        requried:true,
        
    },
   role: {
        type: String,
        enum: ['admin', 'technician'], // Only staff roles
        default: 'technician' // New staff start as technicians
    },
    refreshToken:{
        type:String,
       
        default:null,
    }

});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        this.password = await bcrypt.hash(this.password,10)
    } catch (error) {
       throw err;
        
    }
    
})

UserSchema.methods.comparePassword = async function (plain) {

    try {
        return await bcrypt.compare(plain,this.password)
        
    } catch (error) {
        throw error
        
    }
    
}

export const  Users = mongoose.model("users_data",UserSchema)