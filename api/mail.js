require('dotenv').config();
const nodemailer = require("nodemailer");

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
  console.log('body: ',body);
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
  console.log('リクエストデータ正常')

  //認証情報
  const auth = {
    type: "OAuth2",
    user: process.env.USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  };

  const transport = {
    service: "gmail",
    auth,
  };
  console.log("メール設定オプション:", transport)
  const transporter = nodemailer.createTransport(transport);

  const content = `
  <p>※このメールはシステムからの自動返信です</p>
  <p>${process.env.ADMIN_NAME}様</p>
  <p>お世話になっております。</p>
  <p>Matroosからお問い合わせを受け付けました</p>
  <p>(URL: ${url})</p>
  <p>以下、ご確認お願い致します。</p>
  <br>
  <p>━━━━━━□■□　お問い合わせ内容　□■□━━━━━━</p>
  <p>お問い合わせ先: ${contactInfo}</p>
  <p>会社名：${
    !companyName || companyName === "個人" ? "なし（個人）" : companyName
  }</p>
  <p>ご担当者名：${name}</p>
  <p>電話番号：${tel}</p>
  <p>メール：${replyTo}</p>
  <p>サイトURL：${url}</p>
  <br>
  <p>お問い合わせ内容：${title}</p>
  <p>お問い合わせ内容（詳細）</p>
  <hr>
  <p>${text}</p>
  <hr>
  <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
  `;

  const mailOptions = {
    from: "matroos.tokyo@gmail.com",
    to: process.env.MAIL_TO,
    subject: process.env.SUBJECT,
    text: content,
  };

  let res;
  transporter.sendMail(mailOptions, (err, response) => {
    console.log(err || response);
    if (!err) {
      res = "success";
      console.log("メール送信が成功しました");
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    } else {
      res = "failed";
      console.warn("メール送信に失敗しました。");
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }
  });

};
