const express = require("express");
const router = express.Router();


//router.get("/", (req,res) => {res.render("houseone");}); 

router.get('/', (req, res) => {
    // Render the houseone.hbs template and pass the environment variables
    res.render('houseone', {
        GOOGLEAPI: process.env.GOOGLEAPI,
        h1lat: process.env.h1lat,
        h1lng: process.env.h1lng
    });
});


module.exports = router;