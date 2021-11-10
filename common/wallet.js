const bip39 = require('bip39');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { hdkey } = require('ethereumjs-wallet');
const db = require('../db/mysql');

// http에ㅐ서 동작하는 node에 연결하기 위해 HttpProvider 사용해 web3 객채 생성
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.api_key)); // infura project id

// 지갑 생성
exports.newWallet = async (password) => {
    try {
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
        return result;
    }catch (e) {
        console.log(e);
        return {msg : "fail"}
    }
}
// 잔여 이더리움 조회
exports.getBalance = async (addr) => {
    try {
        let balance = await web3.eth.getBalance(addr);
        balance = balance+"";
        balance =  web3.utils.fromWei(balance,"ether");
        // let balance = await web3.utils.fromWei(web3.eth.getBalance(addr), 'ether'); // wallet address
        // balance = await web3.utils.fromWei(balance, 'ether');
        console.log(balance);
        const result = {
            msg : "balance 조회 성공"
            , balance
        }
        return result;
    }catch (e) {
        console.log(e);
        return {msg : 'fail'}
    }
};

// 코인 전송
exports.sendCoin = async (to_addr, from_addr, pri_key, coin_num, user_email) => {
    try {
        const gas = await web3.eth.getGasPrice();
        let tx_id = '';
        coin_num = web3.utils.toWei(coin_num.toString(), "ether");
        console.log("coin_num = "+coin_num);
        // nonce 값 조회
        const sendRes = await web3.eth.getTransactionCount(from_addr, async (err, nonce) => {
            // 트랜잭션 데이터 생성
            const txObj = {
                nonce: web3.utils.toHex(nonce),
                to: to_addr,
                from: from_addr,
                // value: '0x2386f26fc10000',
                value: web3.utils.toHex(coin_num),
                gasPrice: web3.utils.toHex(gas), // 가스(수수료) 가격
                gasLimit: web3.utils.toHex(300000)
            }
            const tx = new Tx(txObj, {'chain': 3});

            // 트랜잭션에 서명
            const privateKey = Buffer.from(pri_key, 'hex');
            tx.sign(privateKey);

            // 트랜잭션 전송
            const serializedTx = '0x' + tx.serialize().toString('hex')
            // const resTx = await web3.eth.sendSignedTransaction(serializedTx, async (err, txId) => {
            const resTx = await web3.eth.sendSignedTransaction(serializedTx, (err, txId) => {
                if (!err) {
                    console.log('txId11 = ' + txId);
                } else {
                    console.log(err);
                }
            })
            console.log(resTx)
            const insertTx = await db.setTxInfo(user_email, resTx.transactionHash);
        });

        const result = {
            msg : "코인 전송 성공"
            , sendRes
        }
        return result;
    }catch (e) {
        console.log(e);
        return {msg : 'fail'};
    }
}