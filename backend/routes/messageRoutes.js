const express = require('express')
const router = express.Router()

const {saveMessage,getConversation}   = require('../controller/messageController')

router.post('/save', saveMessage)
router.get('/conversation/:senderId/:receiverId',getConversation)

module.exports = router