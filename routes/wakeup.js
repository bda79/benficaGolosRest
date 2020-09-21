const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    console.log("call")
    res.send("awake");
});

module.exports = router;