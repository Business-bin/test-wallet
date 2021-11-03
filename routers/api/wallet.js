const express = require('express');
const router = express.Router();
const bip39 = require('bip39');
const Web3 = require('web3');
const { hdkey } = require('ethereumjs-wallet');

// mnemonic 생성
router.post('/newMnemnic', async (req, res) => {
    try {
        const mnemonic = bip39.generateMnemonic();
        console.log('mnemonic = '+mnemonic)
        res.send('mnemonic 생성 성공 '+mnemonic);
    }catch (e) {
        console.log('mnemonic 생성 에러');
        console.log(e);
        res.send('mnemonic 생성 에러');
    }
});

// wallet 생성
router.post('/newWallet', async (req, res) => {
    try {
        const password = req.body.password;
        // const mnemonic = req.body.mnemonic;
        const mnemonic = bip39.generateMnemonic();
        const path = "m/44'/60'/0'/0/0";    // 이더리움 경로, 비트코인은 m/44'/0'/0'/0

        const seed = bip39.mnemonicToSeedSync(mnemonic, password);  //  mnemonic, password 로 시드 생성
        const hdWallet = hdkey.fromMasterSeed(seed);    // 마스터 키,
        const wallet = hdWallet.derivePath(path).getWallet();
        const address = "0x" + wallet.getAddress().toString("hex");
        const privateKey = wallet.getPrivateKey().toString("hex");

        const result = {
            msg : "지갑생성 생성 성공"
            , hdWallet
            , mnemonic
            , wallet
            , address
            , privateKey
        }
        res.send(result);
    }catch (e) {
        console.log(e);
        res.send('지갑생성 생성 에러');
    }
});

// 지갑 balance 조회
router.post('/getBalance', async (req, res) => {
    try {
        const web3 = new Web3(process.env.eth_con); // infura project id
        const balance = await web3.eth.getBalance(process.env.eth_address); // wallet address
        console.log(balance);

        const result = {
            msg : "balance 조회 성공"
            , balance
        }
        res.send(result);
    }catch (e) {
        console.log(e);
        res.send('조회 에러');
    }
});

module.exports = router;