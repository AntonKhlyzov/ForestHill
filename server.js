const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const Handlebars = require("handlebars"); 
const path = require("path");
const app = express();
const bodyParser = require('body-parser'); 
const cors = require("cors");
const axios = require('axios');
const ICAL = require('ical.js');
const dotenv = require('dotenv');

dotenv.config();

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());								
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Public')));

// View engine setup
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",                                                       
    defaultLayout: 'main',           
    layoutsDir: path.join(__dirname, "./views/Layouts"),
    partialsDir: path.join(__dirname, "./views/Partials")                         
}));
app.set("view engine", ".hbs"); 

// Routes
app.use('/', require('./routes/index'));
app.use('/contact', require('./routes/contact'));
app.use('/moderncoralvilla', require('./routes/houseone'));
app.use('/luxurycoralvilla', require('./routes/housetwo'));
app.use('/terms', require('./routes/terms'));
app.use('/privacy', require('./routes/privacy'));
app.use('/faq', require('./routes/faq'));
app.use('/send-booking-request', require('./routes/bookingRequest'));

// Calendar parser functions
const { fetchAIRBNBICalData, parseAIRBNBICalData } = require('./routes/calparserairbnb');
const { fetchVRBOICalData, parseVRBOICalData } = require('./routes/calparservrbo');

// Exponential backoff function
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, fetchFunction, maxRetries = 5, backoff = 300) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetchFunction(url);
        } catch (error) {
            if (attempt === maxRetries || (error.response && error.response.status !== 429)) {
                throw error;
            }
            console.log(`Attempt ${attempt} failed. Retrying in ${backoff} ms...`);
            await sleep(backoff);
            backoff *= 2; // Exponential backoff
        }
    }
}

app.get('/moderncoralvilla-calendar-parsed', async (req, res) => {
    try {
        const airbnbIcalUrl = process.env.h1_AIRBNB_ICAL_URL;
        const vrboIcalUrl = process.env.h1_VRBO_ICAL_URL;

        const airbnbIcalData = await fetchWithRetry(airbnbIcalUrl, fetchAIRBNBICalData);
        const disabledDates = parseAIRBNBICalData(airbnbIcalData);

        const vrboIcalData = await fetchWithRetry(vrboIcalUrl, fetchVRBOICalData);
        const disabledDates1 = parseVRBOICalData(vrboIcalData);

        const totalDisabledDates = [...disabledDates, ...disabledDates1];

        res.json(totalDisabledDates); 
    } catch (error) {
        console.error('Error fetching and parsing calendar data:', error);
        res.status(500).send('Error fetching and parsing calendar data');
    }
});

app.get('/luxurycoralvilla-calendar-parsed', async (req, res) => {
    try {
        const airbnbIcalUrl = process.env.h2_AIRBNB_ICAL_URL;
        const vrboIcalUrl = process.env.h2_VRBO_ICAL_URL;

        const airbnbIcalData = await fetchWithRetry(airbnbIcalUrl, fetchAIRBNBICalData);
        const disabledDates = parseAIRBNBICalData(airbnbIcalData);

        const vrboIcalData = await fetchWithRetry(vrboIcalUrl, fetchVRBOICalData);
        const disabledDates1 = parseVRBOICalData(vrboIcalData);

        const totalDisabledDates = [...disabledDates, ...disabledDates1];

        res.json(totalDisabledDates); 
    } catch (error) {
        console.error('Error fetching and parsing calendar data:', error);
        res.status(500).send('Error fetching and parsing calendar data');
    }
});

// VRBO price fetching functions
const { constructVrboUrl } = require('./routes/constructVrboUrl');
const { scrapeVrboPrice } = require('./routes/scrapeVrboPrice');

app.post('/get-vrbo-price', async (req, res) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const numGuests = req.body.numGuests;
        const propertyId = req.body.propertyid;

        console.log('Start date/End date/ num of guests / property id:', startDate, endDate, numGuests, propertyId);

        const vrboUrl = constructVrboUrl(startDate, endDate, numGuests, propertyId);
        console.log('VRBO URL:', vrboUrl);

        const price = await scrapeVrboPrice(vrboUrl);
        console.log('VRBO price:', price);

        res.json({ price: price });
    } catch (error) {
        console.error('Error fetching VRBO price:', error.message);
        res.status(500).send('Error fetching VRBO price');
    }
});

// Start server
const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});
