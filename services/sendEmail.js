const nodemailer = require("nodemailer");
const emailConfig = require("../config/email");
const Email = require("email-templates");

let transport = nodemailer.createTransport(emailConfig);

const email = new Email({
  message: {
    from: emailConfig.auth.user,
  },
  send: true,
  preview: false,
  transport: transport,
});

const sendOrderConfirmationEmail = (to, items) => {
  email
    .send({
      template: "orders",
      message: {
        to: to,
      },
      locals: {
        items: items,
      },
      attachments: [
        {
          filename: "logo.jpg",
          path: `${__dirname}/../emails/orders/images/logo.png`,
          cid: "logo",
        },
        {
          filename: "facebook.png",
          path: `${__dirname}/../emails/orders/images/facebook.png`,
          cid: "facebook",
        },
        {
          filename: "instagram.jpg",
          path: `${__dirname}/../emails/orders/images/insta.png`,
          cid: "instagram",
        },
      ],
    })
    .then(() => {})
    .catch((error) => {
      console.log("error", error);
    });
};

module.exports = { sendOrderConfirmationEmail };
