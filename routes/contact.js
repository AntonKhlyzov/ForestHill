

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

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

router.get("/", (req, res) => {
    res.render("landingpage", { msg: {} }); // Initialize msg as an empty object
});

router.post("/", (req, res) => {
    let form = new multiparty.Form();
    let data = {};
    form.parse(req, function (err, fields) {
        Object.keys(fields).forEach(function (property) {
            data[property] = fields[property].toString();
        });

        const mail = {
            sender: `${data.name} <${data.email}>`,
            to: process.env.EMAIL,
            subject: `${data.name} sent you a message via the website!`,
            text: `From: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\nMessage: ${data.message}`,
        };

        transporter.sendMail(mail, (err, info) => {
            if (err) {
                console.log(err);
                res.render("landingpage", {
                    msg: { type: "error", text: "Something went wrong. Please try again later." },
                });
            } else {
                // Scroll to the contact section and display success message
                res.render("landingpage", {
                    msg: { type: "success", text: "Your message was successfully sent. We will get back to you shortly." },
                });
            }
            
        });
    });
});

module.exports = router;
