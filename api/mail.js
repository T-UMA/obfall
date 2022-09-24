require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const checkRequestParameter = (httpMethod, params) => {
  return (
    httpMethod === "POST" &&
    params.url &&
    params.contactInfo &&
    params.name &&
    params.replyTo &&
    params.title &&
    params.text &&
    checkMailAddress(params.replyTo)
  );
};

const checkMailAddress = (mail) => {
  const regExp = new RegExp(
    "^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*.)+[a-zA-Z]{2,}$"
  );
  const result = regExp.test(mail);
  result || console.warn(`メールアドレスのチェック結果が不正です${mail}`);
  return result;
};

exports.handler = async (event, _context) => {
  const { httpMethod } = event;
  let body = event.body;
  body = decodeURIComponent(body).replace("/'/g", '"');
  console.log("body: ", body);
  const params = JSON.parse(body);
  const url = params.url;
  const contactInfo = params.contactInfo;
  const companyName = params.companyName;
  const name = params.name;
  const tel = params.tel;
  const replyTo = params.replyTo;
  const title = params.title;
  const text = params.text.replace(/\n/g, "<br>");
  if (!checkRequestParameter(httpMethod, params)) {
    console.warn(`リクエストデータの値が不正です。
    {
      httpMethod: ${httpMethod},
      contactInfo: ${contactInfo},
      companyName: ${companyName},
      name: ${name},
      tel: ${tel},
      replyTo: ${params.replyTo},
      title: ${params.title},
      text: ${params.text}
    }`);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
  console.log("リクエストデータ正常");

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  const accessToken = await oAuth2Client.getAccessToken();
  //認証情報
  const auth = {
    type: "OAuth2",
    user: process.env.USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: accessToken
  };
  const transport = {
    service: "gmail",
    auth: auth,
  };
  const transporter = nodemailer.createTransport(transport);

  const content = `
  <p>※このメールはシステムからの自動返信です</p>
  <p>${process.env.ADMIN_NAME}様</p>
  <p>お世話になっております。</p>
  <p>Matroos社員紹介サイトよりお問い合わせを受け付けました</p>
  <p>問い合わせ元URL: ${url}</p>
  <p>以下、ご確認お願い致します。</p>
  <br>
  <p>━━━━━━□■□　問い合わせた方の情報　□■□━━━━━━</p>
  <p>会社名：${
    !companyName || companyName === "個人" ? "なし（個人）" : companyName
  }</p>
  <p>ご担当者名：${name}</p>
  <p>ご担当者電話番号：${tel}</p>
  <p>返信先メールアドレス：${replyTo}</p>
  <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
  <br>
  <p>━━━━━━□■□　お問い合わせ内容　□■□━━━━━━</p>
  <p>問い合わせ先社員: ${contactInfo}</p>
  <h3>件名：${title}</h3>
  <h3>本文</h3>
  <p style="margin-left: 1em;">${text}</p>
  <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
  `;
  console.log("送信内容:", content);

  const mailOptions = {
    from: "matroos.tokyo@gmail.com",
    to: process.env.MAIL_TO,
    subject: process.env.SUBJECT,
    html: content,
  };

  try {
    console.log("メールを送信します");
    const response = await transporter.sendMail(mailOptions);
    console.log(response);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  } catch (e) {
    console.error(e);
    return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
  }
};
