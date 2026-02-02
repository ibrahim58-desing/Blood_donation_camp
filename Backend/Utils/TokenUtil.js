import jwt from "jsonwebtoken";

export const generateToken = (id,role) => {
    return jwt.sign({id,role}, process.env.JWT_SECRET, { expiresIn: "1d" })
}


export const generateRefreshToken = (id,role)=>{
    return jwt.sign({id,role},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
}