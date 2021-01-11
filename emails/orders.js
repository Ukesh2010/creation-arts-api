const nodemailer = require("nodemailer");
const emailConfig = require("../config/email");

let transport = nodemailer.createTransport(emailConfig);

const sendOrderConfirmationEmail = (to) => {
  const message = {
    from: emailConfig.auth.user,
    to: to,
    subject: "Order created",
    html: `Dear sir/madam,
<br/>Thank you for your order from Creation arts.
<br/>Once your order is confirmed.
<br/><br>Thank You. creation arts`,
  };

  transport.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = { sendOrderConfirmationEmail };
