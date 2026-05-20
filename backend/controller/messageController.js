const Message = require('../models/Message')

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

module.exports = { saveMessage }