import express from 'express'
import { Users } from '../Mongoose/Model/UserSchema.js';
import { checkSchema, matchedData, validationResult } from "express-validator";
import { createuservalidationschema } from '../Utils/ValidationSchema.js';
import { protect,authorize} from '../Middleware/Auth.js';
import { generateToken, generateRefreshToken } from '../Utils/TokenUtil.js';

const router = express.Router();

router.post('/register' ,  checkSchema(createuservalidationschema), async (req, res) => {
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

        const token = generateToken(user._id, user.role)

        const refreshToken = generateRefreshToken(user._id, user.role);


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

router.post('/login' , async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("=================================");
        console.log("LOGIN ATTEMPT RECEIVED:");
        console.log("Email:", email);
        console.log("Password received:", password ? "[PROVIDED]" : "[MISSING]");
        console.log("=================================");

        // Find user
        const user = await Users.findOne({ email });
        
        console.log("User found:", user ? "YES" : "NO");
        
        if (!user) {
            console.log("❌ User not found in database");
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        console.log("User role from DB:", user.role);
        console.log("User ID:", user._id);

        // Check password
        const isMatch = await user.comparePassword(password);
        
        console.log("Password match:", isMatch ? "YES" : "NO");

        if (!isMatch) {
            console.log("❌ Password incorrect");
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.role);
        
        console.log("✅ Login successful!");
        console.log("Token generated:", token ? "YES" : "NO");
        console.log("=================================");

        user.refreshToken = refreshToken;
        await user.save();

        // Send token to client
        res.json({
            msg: "Login successful",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log("❌ ERROR in login endpoint:");
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

router.post("/password", protect, authorize('admin','technician'),async (req,res) => {

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

// In auth.routes.js - Add admin login endpoint
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            });
        }

        // CRITICAL: Check if user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                msg: "Access denied. Admin privileges required."
            });
        }

        // Generate tokens
        const token = generateToken(user._id, user.role)

        const refreshToken = generateRefreshToken(user._id, user.role);

        user.refreshToken = refreshToken;
        await user.save();

        // Send response
        res.json({
            success: true,
            msg: "Admin login successful",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role // Important: Include role in response
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ 
            success: false, 
            msg: "Server error during admin authentication" 
        });
    }
});

// In auth.routes.js - Add admin verification endpoint
router.get('/admin/verify', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        msg: "Admin privileges verified",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});


export default router