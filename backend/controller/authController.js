const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


 const registerUser = async(req,res)=>{
    try {
        let {username,email,phone,password} = req.body
       

        if(!username || !email || !phone || !password) {
           return res.status(400).json({
                error:true,
                success:false,
                message:"all filed are required"
            })
        }

        let emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!emailReg.test(email)) {
            return res.status(400).json({
                error:true,
                success:false,
                message: "Enter valid email please"
            })
        }

        let userExist = await User.findOne({email})

        if(userExist)
        {
            return res.status(409).json({
                error:true,
                success:false,
                message: "user already exist"
            })
        }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        phone,
        password:hashedPassword
    })
        return res.status(201).json({
            error:false,
            success:true,
            message: "user register successfully",
            data:{
                id:newUser.id,
                username:newUser.username,
                email:newUser.email,
                phone:newUser.phone
            }
        })

    } catch (error) {
        res.status(500).json({
            error:true,
            success:false,
            message:error.message
        })
    }
} 

const loginUser = async (req,res) => {
    try {
        let {email,password} = req.body

        if(!email || !password) {
            return res.status(400).json({
                 error:true,
                 success:false,
                 message:"all filed are required"
             })
         }
         let emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!emailReg.test(email)) {
            return res.status(400).json({
                error:true,
                success:false,
                message: "Enter valid email please"
            })
        }

        let userExist = await User.findOne({email})

        if(!userExist)
        {
            return res.status(409).json({
                error:true,
                success:false,
                message: "user not found"
            })
        }

        let checkPassword = await bcrypt.compare(password,userExist.password)
        
        if (!checkPassword) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "invalid password"
            })
        }

        let token = jwt.sign(
            {id:userExist.id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        return res.status(200).json({
            error: false,
            success: true,
            message: "User login successful",
            token,
            user: {
                id: userExist._id,
                username: userExist.username,
                email: userExist.email,
                phone: userExist.phone
            }
        })

    } catch (error) {
        res.status(500).json({
            error:true,
            success:false,
            message:error.message
        })
    }

}

const getAllUser = async(req,res)=>{
    try {
        const users = await User.find({},'-password')
        return res.status(200).json({
            error: false,
            success: true,
            users
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getAllUser
}