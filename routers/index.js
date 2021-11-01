const express = require('express');
const router = express.Router();
const wallet = require("./api/wallet");

router.use('/wallet', wallet);

module.exports = router;