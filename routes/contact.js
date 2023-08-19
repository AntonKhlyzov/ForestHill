const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  // verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });


router.get("/", (req,res) => {res.render("contact");}); 

router.post("/", (req, res) => {
    let form = new multiparty.Form();
    let data = {};
    form.parse(req, function (err, fields) {
      Object.keys(fields).forEach(function (property) {
        data[property] = fields[property].toString();
      });
      console.log(data);
      const mail = {
        sender: `${data.name} <${data.email}>`,
        to: process.env.EMAIL, // receiver email,
        subject: `${data.name} sent you a message via website!`,
        text: `From: ${data.name} \nEmail: ${data.email} \nSubject: ${data.subject} \nMessage: ${data.message}`,
      };
      transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          //res.status(500).send("Something went wrong.");
          res.render("contact", {msg:"Something went wrong. Please try again later."});
        } else {
          //res.status(200).send("Email successfully sent to recipient!");
          res.render("contact", {msg:"Your message was successfully sent. We will get back to you shortly!"});
        }
      });
    });
  });


module.exports = router;