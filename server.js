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

app.use('/coralvilla',require('./routes/houseone'));


//listening to port 3000
const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});