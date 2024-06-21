const express = require("express");
const router = express.Router();


//router.get("/", (req,res) => {res.render("housetwo");}); 

router.get('/', (req, res) => {
    // Render the houseone.hbs template and pass the environment variables
    res.render('housetwo', {
        GOOGLEAPI: process.env.GOOGLEAPI,
        h2lat: process.env.h2lat,
        h2lng: process.env.h2lng
    });
});


module.exports = router;