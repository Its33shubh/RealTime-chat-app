const Message = require('../models/Message')
const mongoose = require("mongoose")

const saveMessage = async (req, res) => {
    try {
        let { senderId, receiverId, text } = req.body

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "all fields are required"
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text
        })

        return res.status(201).json({
            error: false,
            success: true,
            message: "message saved successfully",
            data: newMessage
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message
        })
    }
}
const getConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params

        const messages = await Message.find({
            $or: [
                {
                    senderId: senderId,
                    receiverId: receiverId
                },
                {
                    senderId: receiverId,
                    receiverId: senderId
                }
            ]
        }).sort({ createdAt: 1 })

        await Message.updateMany(
            {
                senderId: receiverId,
                receiverId: senderId,
                isRead: false
            },
            {
                isRead: true
            }
        )
        

        return res.status(200).json({
            error: false,
            success: true,
            messages
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message
        })
    }
}
const getUnreadCounts = async (req, res) => {
    try {
        const { userId } = req.params

        const unreadMessages = await Message.aggregate([
            {
                $match: {
                    receiverId: new mongoose.Types.ObjectId(userId),
                    isRead: false
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ])

        return res.status(200).json({
            error: false,
            success: true,
            unreadMessages
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message
        })
    }
}

module.exports = { saveMessage,getConversation,getUnreadCounts }