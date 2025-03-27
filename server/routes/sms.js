const express = require('express');
const router = express.Router();
const { sendSmsCode } = require('../services/smsService');

// 发送短信验证码
router.post('/send-code', async (req, res) => {
    try {
        const { phone } = req.body;

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '无效的手机号格式' });
        }

        const result = await sendSmsCode(phone);
        res.json(result);
    } catch (error) {
        console.error('发送验证码失败:', error);
        res.status(500).json({ message: '发送验证码失败，请重试' });
    }
});

module.exports = router; 