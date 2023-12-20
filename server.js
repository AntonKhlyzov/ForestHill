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


app.use('/send-booking-request', require('./routes/bookingRequest'));//  route for handling booking requests

// app.use('/calendar',require('./routes/calendar'));

// app.use('/fullcalendar', express.static(path.join(__dirname, 'node_modules/fullcalendar/dist')));

const { fetchAIRBNBICalData, parseAIRBNBICalData } = require('./routes/calparserairbnb');
const { fetchVRBOICalData, parseVRBOICalData } = require('./routes/calparservrbo');


app.get('/moderncoralvilla-calendar-parsed', async (req, res) => {
    try {
        // Fetch iCal data from Airbnb and parse it
        const airbnbIcalUrl = 'https://www.airbnb.ca/calendar/ical/8794140.ics?s=795c7fd37b2b44b0c93aee1d11327435';
        const icalData = await fetchAIRBNBICalData(airbnbIcalUrl);
        const disabledDates = parseAIRBNBICalData(icalData);
    
        // Fetch iCal data from VRBO and parse it
        const vrboIcalUrl = 'http://www.vrbo.com/icalendar/aeef23a78ea24f91a41ff9e6821c8675.ics?nonTentative';
        const icalData1 = await fetchVRBOICalData(vrboIcalUrl);
        const disabledDates1 = parseVRBOICalData(icalData1);

        // Combine disabledDates and disabledDates1 into totaldisabledDates
        const totaldisabledDates = [...disabledDates, ...disabledDates1];

        res.json(totaldisabledDates); // Send the parsed disabled dates as JSON response
    } catch (error) {
        console.error('Error fetching and parsing calendar data:', error);
        res.status(500).send('Error fetching and parsing calendar data');
    }
});


const {constructVrboUrl} = require('./routes/constructVrboUrl');
const {scrapeVrboPrice} = require('./routes/scrapeVrboPrice');
app.post('/get-vrbo-price-Modern-Coral-Villa', async (req, res) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const numGuests = req.body.numGuests;
        const propertyid = req.body.propertyid;
        console.log('Start date/End date/ num of guests / property id:', startDate, endDate, numGuests, propertyid);
        // Use the selected dates to construct the VRBO URL
        const vrboUrl = constructVrboUrl(startDate, endDate, numGuests, propertyid);
        console.log('VRBO URL:', vrboUrl);
        // Use a scraping function to get the price from the VRBO page
        const price = await scrapeVrboPrice(vrboUrl);
        console.log('VRBO price:', price);
        // Send the price back to the client
        res.json({ price: price });
    } catch (error) {
        console.error('Error fetching VRBO price:', error.message);
        res.status(500).send('Error fetching VRBO price');
    }
});


//listening to port 3000
const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});