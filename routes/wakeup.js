const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    res.send("awake");
});

module.exports = router;