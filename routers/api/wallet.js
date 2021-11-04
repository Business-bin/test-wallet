const express = require('express');
const db = require('../../db/mysql');
const router = express.Router();
const bip39 = require('bip39');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { hdkey } = require('ethereumjs-wallet');
const wallet = require('../../common/wallet');
const crypto = require('../../common/crypto');

// http에ㅐ서 동작하는 node에 연결하기 위해 HttpProvider 사용해 web3 객채 생성
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.api_key)); // infura project id

router.get('/signUp', async (req, res) => {
    res.render('signUp.ejs')
});
router.post('/signUp', async (req, res) => {
    console.log('회원가입')
    try{
        const {
            name,
            email,
            password
        } = req.body
        // password 단방향 암호화
        const enc_pw = await crypto.encryption(password);
        // 지갑생성
        const result = await wallet.newWallet(password);
        if(result.msg === 'fail')
            throw Error("지갑생성 에러");
        // 지갑정보 양방향 암호화
        const w_mnemonic = await crypto.encryptAES(result.mnemonic);
        const w_addr = await crypto.encryptAES(result.address);
        const w_pri_key = await crypto.encryptAES(result.privateKey);
        const w_pub_key = await crypto.encryptAES(result.wallet.publicKey.toString('hex'));

        const insert_row = await db.setUserInfo(email, enc_pw.pw, name, w_mnemonic, w_addr, w_pri_key, w_pub_key, enc_pw.salt);
        console.log(insert_row)
        console.log('회원가입 OK')
        res.render('login.ejs')
    }catch (e){
        console.log(e);
        res.send('회원가입 에러');
    }
});

router.post('/signIn', async (req, res) => {
    console.log('로그인')
    try{
        const {
            email,
            password
        } = req.body
        if(!email || !password){
            res.send("<script>alert('이메일과 패스워드를 입력하세요.');location.href='/';</script>");
            return;
        }
        const user = await db.getUserInfo(email)
        if(user.length == 0){
            console.log("fail")
            res.send("<script>alert('이메일과 패스워드를 확인하세요.');location.href='/';</script>");
            return;
        }
        const enc_pw = await crypto.confirmPw(password, user[0].SALT);
        if(user[0].USER_PWD === enc_pw) {
            res.render('w_main.ejs', {data:user});
        }else{
            res.send("<script>alert('이메일과 패스워드를 확인하세요.');location.href='/';</script>");
        }
    }catch (e) {
        console.log(e);
        res.send('로그인 에러');
    }
});
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

// 송금
router.post('/sendCoin', async (req, res) => {
    try {
        const send_addr = process.env.eth_address;  // 보내는 주소
        const receive_addr = '0xe0C17FB5218e6BB3c6055019326E6E5804D95225';  // 받는 주소 0xe0C17FB5218e6BB3c6055019326E6E5804D95225

        const gas = await web3.eth.getGasPrice();
        // nonce 값 조회
        const sendRes = web3.eth.getTransactionCount(send_addr, (err, nonce) => {
            // 트랜잭션 데이터 생성
            const txObj = {
                nonce: web3.utils.toHex(nonce),
                to: receive_addr,
                from: send_addr,
                value: '0x2386f26fc10000',
                gasPrice: web3.utils.toHex(gas), // 가스(수수료) 가격
                gasLimit: web3.utils.toHex(300000)
            }
            const tx = new Tx(txObj,{'chain':3});

            // 트랜잭션에 서명
            const privateKey = Buffer.from('4b9780305219843a0a94af07cea6e9a1e8a47482d8d018eeb1ba72633ab3e1b7', 'hex')
            tx.sign(privateKey)

            // 트랜잭션 전송
            const serializedTx = '0x' + tx.serialize().toString('hex')
            console.log("111111111111111111")
            const resTx = web3.eth.sendSignedTransaction(serializedTx, (err, txId) =>{
                if(!err)
                    console.log('txId ='+txId)
                else
                    console.log(err)
            })
            console.log("22222222222222222")
            console.log(resTx)
        });

        const result = {
            msg : "코인 전송 성공"
            , sendRes
        }
        res.send(result);
    }catch (e) {
        console.log(e);
        res.send('코인 전송 에러');
    }
});

module.exports = router;