const bip39 = require('bip39');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { hdkey } = require('ethereumjs-wallet');

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