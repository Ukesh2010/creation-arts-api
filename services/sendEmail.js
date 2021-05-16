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

const sendOrderConfirmationEmail = (to, items, assets) => {
  email
    .send({
      template: "orders",
      message: {
        to: to,
      },
      locals: {
        items: items,
        assets: assets,
      },
    })
    .then(() => {})
    .catch((error) => {
      console.log("error", error);
    });
};

const sendPasswordResetLink = (to, token) => {
  transport.sendMail({
    from: emailConfig.auth.user,
    to: to,
    subject: "Password reset",
    html: `<a href='http://yalatreasure.com/reset-password?token=${token}'>Reset password</a>`,
  });
};

module.exports = { sendOrderConfirmationEmail, sendPasswordResetLink };
