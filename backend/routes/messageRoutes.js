const express = require('express')
const router = express.Router()

const {saveMessage,getConversation,getUnreadCounts}   = require('../controller/messageController')

router.post('/save', saveMessage)
router.get('/conversation/:senderId/:receiverId',getConversation)
router.get('/unread/:userId',getUnreadCounts)


module.exports = router