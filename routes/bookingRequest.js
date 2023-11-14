const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');

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
        console.log('Server is ready to take our messages');
    }
});

router.post('/', (req, res) => {
    const { guestDetails, bookingDetails } = req.body;

    // Convert subtotal, cleaningFee, deposit, and total to numbers
    bookingDetails.subtotal = parseFloat(bookingDetails.subtotal);
    bookingDetails.cleaningFee = parseFloat(bookingDetails.cleaningFee);
    bookingDetails.deposit = parseFloat(bookingDetails.deposit);
    bookingDetails.total = parseFloat(bookingDetails.total);

    const mail = {
        sender: `${guestDetails.firstName} ${guestDetails.lastName} <${guestDetails.email}>`,
        to: process.env.EMAIL,
        subject: 'New Booking Request',
        text: `
            First Name: ${guestDetails.firstName}
            Last Name: ${guestDetails.lastName}
            Email: ${guestDetails.email}
            Phone: ${guestDetails.phone}
            Custom Message: ${guestDetails.customMessage}

            Booking Details:
            Start Date: ${bookingDetails.startDate}
            End Date: ${bookingDetails.endDate}
            Total Nights: ${bookingDetails.totalNights}
            Number of Guests: ${bookingDetails.numGuests}
            Subtotal: $${bookingDetails.subtotal.toFixed(2)}
            Cleaning Fee: $${bookingDetails.cleaningFee.toFixed(2)}
            Deposit: $${bookingDetails.deposit.toFixed(2)}
            Total Amount: $${bookingDetails.total.toFixed(2)}
        `,
    };

    transporter.sendMail(mail, (err, info) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Something went wrong. Please try again later.' });
        } else {
            res.status(200).send({ message: 'Booking request successfully sent.' });
        }
    });
});



module.exports = router;
