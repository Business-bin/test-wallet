const express = require('express');
const router = express.Router();
const bip39 = require('bip39');
const ethers = require('ethers');
const querystring = require("querystring");


router.post('/creatWallet', async (req, res) => {
    try {
        const password = req.body.password;
        console.log(password)
        const mnemonic = bip39.generateMnemonic();
        console.log('mnemonic = '+mnemonic)
        res.send('지갑 생성 성공 '+mnemonic);
    }catch (e) {
        console.log('지갑 생성 에러');
        res.send('지갑 생성 에러');
        console.log(e);
    }
});

module.exports = router;