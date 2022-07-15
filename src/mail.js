require('dotenv').config();
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, _context) => {
  const {httpMethod, body} = event
  console.log(body);
  console.log(body.data);
  if (!checkRequestParameter(httpMethod, body.data)) {
    console.warn(`リクエストデータの値が不正です。
    {
      httpMethod: ${httpMethod},
      replyTo: ${body.data.replyTo},
      name: ${body.data.name},
      text: ${body.data.text}
    }`);
    return {
      statusCode:400
    }
  } 
  const name = body.name
  const replyTo = body.replyTo
  const text = body.text
  const content = 
  `
  <p style="font-weight:bold">${name}さんからお問い合わせが来ました</p>
  <br>
  <p>以下はお問い合わせ内容です</p>
  <hr>
  <p>${text}</p>
  <p>返信先：${replyTo}</p>
  `
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
   to: process.env.MAIL_TO,
   from: process.env.MAIL_FROM,
   subject: `${name}さんからお問い合わせがあります`,
   html:content
  };
  try {
    await sgMail.send(msg);
    console.warn("メール送信が成功しました");
    return {
      statusCode:200
    }
  } catch (error) {
    console.warn(`メール送信に失敗しました。
    {
      httpMethod: ${httpMethod},
      replyTo: ${body.replyTo},
      name: ${body.name},
      text: ${body.text}
    }`);
    return {
      statusCode:500
    }
  } 
}

const checkRequestParameter = (httpMethod,body) => {
  return httpMethod === 'POST' && body.name && body.text && checkMailAddress(body.replyTo)
}

const checkMailAddress = (mail) => {
  const result =  '^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$'.test(mail)
  !result || console.warn(`メールアドレスのチェック結果が不正です${mail}`)  
  return result
}