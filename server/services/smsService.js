const Core = require('@alicloud/pop-core');
const SmsCode = require('../models/SmsCode');

const client = new Core({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

// 生成6位随机验证码
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送短信验证码
async function sendSmsCode(phone) {
    try {
        // 生成验证码
        const code = generateCode();
        
        // 保存验证码到数据库
        await SmsCode.create({ phone, code });
        
        // 发送短信
        const params = {
            PhoneNumbers: phone,
            SignName: process.env.ALIYUN_SMS_SIGN_NAME,
            TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
            TemplateParam: JSON.stringify({ code })
        };
        
        const result = await client.request('SendSms', params, { method: 'POST' });
        
        if (result.Code === 'OK') {
            return { success: true, message: '验证码发送成功' };
        } else {
            throw new Error(result.Message);
        }
    } catch (error) {
        console.error('发送短信失败:', error);
        throw error;
    }
}

// 验证短信验证码
async function verifySmsCode(phone, code) {
    try {
        const smsCode = await SmsCode.findOne({ phone, code });
        if (!smsCode) {
            return { success: false, message: '验证码错误或已过期' };
        }
        return { success: true, message: '验证成功' };
    } catch (error) {
        console.error('验证短信失败:', error);
        throw error;
    }
}

module.exports = {
    sendSmsCode,
    verifySmsCode
}; 