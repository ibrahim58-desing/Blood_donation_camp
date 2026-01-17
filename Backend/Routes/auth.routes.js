import express from 'express'
import { Users } from '../Mongoose/Model/UserSchema.js';
import { checkSchema, matchedData, validationResult } from "express-validator";
import { createuservalidationschema } from '../Utils/ValidationSchema.js';
import { protect} from '../Middleware/Auth.js';
import { generateToken, generateRefreshToken } from '../Utils/TokenUtil.js';

const router = express.Router();

router.post('/register', checkSchema(createuservalidationschema), async (req, res) => {
    try {
        const check1 = validationResult(req)
        if (!check1.isEmpty()) {
            return res.status(401).json({ msg: "it should not be empty" })
        }

        const check2 = matchedData(req)

        const { name, email, password } = check2

        const userexist = await Users.findOne({ email })

        if (userexist) {
            return res.status(404).json({ msg: "User already exists" })
        }

        const user = await Users.create({ name, email, password })

        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id)

        user.refreshToken =refreshToken;
        await user.save();

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token,
            refreshToken,
        })

    } catch (error) {
        console.log("ERROR DETAILS:", error);  // ← See full error
        console.log("ERROR MESSAGE:", error.message);
        return res.status(500).json({ msg: "server down" })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id)

        user.refreshToken =refreshToken;
        await user.save();

        // Send token to client
        res.json({
            msg: "Login successful",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server error" });
    }
});

router.get('/me', protect, (req, res) => {

    res.status(200).json(req.user)
})

router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(401).json({ msg: "Refresh token requried" })
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await Users.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ msg: "I  nvalid refresh token" })
        }

        const newAccessToken = generateRefreshToken(user._id);

        res.join({
            msg: "Token rrefreshed successfully",
            token: newAccessToken
        })

    }

    catch (error) {

        console.log(error);
        return res.status(401).json({ msg: "invalid or expired refresh token" })

    }
})

router.post("/password",protect,async (req,res) => {

    const {oldpassword,newpassword} = req.body

    const user = await Users.findById(req.user._id);

    if (!user) {

        return res.status(401).json({msg:"User not found"})
    }

    const isMatch = await user.comparePassword(oldpassword)

    if (!isMatch) {

        return res.status(401).json({msg:"Old password does not match"})
    }

    user.password=newpassword
    await user.save()

    res.json({msg:"password updated successfully"})
    
})


export default router