const mongoose = require('mongoose');

const smsCodeSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        match: /^1[3-9]\d{9}$/
    },
    code: {
        type: String,
        required: true,
        length: 6
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5分钟后自动删除
    }
});

module.exports = mongoose.model('SmsCode', smsCodeSchema); 