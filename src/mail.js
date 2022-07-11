require('dotenv').config();
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, _context) => {
  const {httpMethod, body, isBase64Encoded} = event

  console.log(event)
  if (!checkRequestParameter(httpMethod, body, isBase64Encoded)) {
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
    return {
      statusCode:200
    }
  } catch (error) {
    return {
      statusCode:500
    }
  }
}

const checkRequestParameter = (httpMethod,body,isBase64Encoded) => {
  return httpMethod === 'POST' && isBase64Encoded && body.name && body.text && checkMailAddress(body.replyTo)
}

const checkMailAddress = (mail) => {
  return '^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$'.test(mail)
}