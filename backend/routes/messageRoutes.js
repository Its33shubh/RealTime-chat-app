const express = require('express')
const router = express.Router()

const {saveMessage}   = require('../controller/messageController')

router.post('/save', saveMessage)

module.exports = router