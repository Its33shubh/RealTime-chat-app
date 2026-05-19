const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


 const registerUser = async(req,res)=>{
    try {
        let {username,email,phone,password} = req.body
        console.log(username,email,phone,password);
        

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

module.exports = {
    registerUser
}