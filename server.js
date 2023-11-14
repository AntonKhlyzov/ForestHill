const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const Handlebars = require("handlebars"); 
const path = require("path");
const app = express();
const bodyParser = require('body-parser'); 

const cors = require("cors");
// cors
app.use(cors({ origin: "*" }));

require("dotenv").config();

const axios = require('axios');
const ICAL = require('ical.js');


//const fs = require("fs");
//const session = require("client-sessions");								
//const randomStr = require("randomstring");

app.use(bodyParser.json());								
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));
app.engine(".hbs", exphbs.engine({ 												
    extname: ".hbs",                                                       
    defaultLayout: 'main',           
    layoutsDir: path.join(__dirname, "./views/Layouts"),
    partialsDir: path.join(__dirname, "./views/Partials")                         
}));

app.set("view engine", ".hbs");                                 
//var strRandom = randomStr.generate();



app.use('/',require('./routes/index'));

app.use('/contact',require('./routes/contact'));

app.use('/moderncoralvilla',require('./routes/houseone'));

app.use('/luxurycoralvilla',require('./routes/housetwo'));

app.use('/terms',require('./routes/terms'));

app.use('/privacy',require('./routes/privacy'));

// New route for handling booking requests
const bookingRequestRoute = require('./routes/bookingRequest'); // Create this file
app.use('/send-booking-request', bookingRequestRoute);

// app.use('/calendar',require('./routes/calendar'));

// app.use('/fullcalendar', express.static(path.join(__dirname, 'node_modules/fullcalendar/dist')));

const { fetchICalData, parseICalData } = require('./routes/calparserairbnb');
const { fetchICalData1, parseICalData1 } = require('./routes/calparservrbo');

app.get('/airbnb-calendar-parsed', async (req, res) => {
    try {
        // Fetch iCal data from Airbnb and VRBO APIs or files and parse them
        const icalData = await fetchICalData(); // Implement a function to fetch Airbnb iCal data
        const disabledDates = parseICalData(icalData);
        
        const icalData1 = await fetchICalData1(); // Implement a function to fetch VRBO iCal data
        const disabledDates1 = parseICalData1(icalData1);

        // Combine disabledDates and disabledDates1 into totaldisabledDates
        const totaldisabledDates = [...disabledDates, ...disabledDates1];

        res.json(totaldisabledDates); // Send the parsed disabled dates as JSON response
    } catch (error) {
        res.status(500).send('Error fetching and parsing calendar data');
    }
});

//listening to port 3000
const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});