const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifySmsCode } = require('../services/smsService');

// 注册
router.post('/register', async (req, res) => {
    try {
        const { phone, password, smsCode } = req.body;

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '无效的手机号格式' });
        }

        // 验证短信验证码
        const verifyResult = await verifySmsCode(phone, smsCode);
        if (!verifyResult.success) {
            return res.status(400).json({ message: verifyResult.message });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: '该手机号已注册' });
        }

        // 创建新用户
        const user = new User({ phone, password });
        await user.save();

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ message: '注册失败，请重试' });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // 查找用户
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: '手机号或密码错误' });
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '手机号或密码错误' });
        }

        // 生成 JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ message: '登录失败，请重试' });
    }
});

module.exports = router; 