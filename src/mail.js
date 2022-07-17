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
      companyName: ${companyName},
      name: ${name},
      tel: ${tel},
      replyTo: ${params.replyTo},
      title: ${params.title},
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
  const url = params.url
  const companyName = params.companyName
  const name = params.name
  const tel = params.tel
  const replyTo = params.replyTo
  const title = params.title
  const text = params.text.replace(/\n/g,'<br>');
  const content = 
  `
  <p>※このメールはシステムからの自動返信です</p>
  <p>${process.env.ADMIN_NAME}様</p>
  <p>お世話になっております。</p>
  <p>Matroosからお問い合わせを受け付けました</p>
  <p>(URL: ${url})</p>
  <p>以下、ご確認お願い致します。</p>
  <br>
  <p>━━━━━━□■□　お問い合わせ内容　□■□━━━━━━</p>
  <p>会社名：${(!companyName || companyName === '個人') ? 'なし（個人）' : companyName }</p>
  <p>ご担当者名：${name}</p>
  <p>電話番号：${tel}</p>
  <p>メール：${replyTo}</p>
  <p>サイトURL：${url}</p>
  <br>
  <p>お問い合わせ内容：${title}</p>
  <p>お問い合わせ内容（詳細）：${text}</p>
  <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
  `
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
   to: process.env.MAIL_TO,
   from: process.env.MAIL_FROM,
   subject: `Matroosのサイトよりお問い合わせがありました`,
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
      url: ${params.url},
      companyName: ${companyName},
      name: ${name},
      tel: ${tel},
      replyTo: ${params.replyTo},
      title: ${params.title},
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
  return (
    httpMethod === 'POST' && 
    params.url &&
    params.name && 
    params.replyTo &&
    params.title &&
    params.text && 
    checkMailAddress(params.replyTo))
}

const checkMailAddress = (mail) => {  
  const regExp = new RegExp('^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$');
  const result =  regExp.test(mail)
  result || console.warn(`メールアドレスのチェック結果が不正です${mail}`)  
  return result
}