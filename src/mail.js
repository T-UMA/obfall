require('dotenv').config();
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, _context) => {
  const {httpMethod} = event
  let body = event.body
  body.replace('/\'/g',"\"");
  console.log(body);
  const params = JSON.parse(body);
  if (!checkRequestParameter(httpMethod, params)) {
    console.warn(`リクエストデータの値が不正です。
    {
      httpMethod: ${httpMethod},
      replyTo: ${params.replyTo},
      name: ${params.name},
      text: ${params.text}
    }`);
    return {
      statusCode:400,
      headers: {
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"Content-Type"
      }
    }
  } 
  const name = params.name
  const replyTo = params.replyTo
  const text = params.text
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
      statusCode:200,
      headers: {
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"Content-Type"
      }
    }
  } catch (error) {
    console.warn(`メール送信に失敗しました。
    {
      httpMethod: ${httpMethod},
      replyTo: ${params.replyTo},
      name: ${params.name},
      text: ${params.text}
    }`);
    return {
      statusCode:500,
      headers: {
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"Content-Type"
      }
    }
  } 
}

const checkRequestParameter = (httpMethod,params) => {
  return httpMethod === 'POST' && params.name && params.text && checkMailAddress(params.replyTo)
}

const checkMailAddress = (mail) => {  
  const regExp = new RegExp('^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$');
  const result =  regExp.test(mail)
  !result || console.warn(`メールアドレスのチェック結果が不正です${mail}`)  
  return result
}