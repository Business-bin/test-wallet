const crypto = require('crypto');
const cryptoJS = require('crypto-js');

const createSalt = () => {
    try{
        const buf = crypto.randomBytes(64)
        return buf.toString('base64');
    }catch (e){
        console.log(e);
    }
}

exports.encryption = pw => {
    const salt = createSalt();
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(pw, salt, 10000, 64, 'sha512', (err, key) => {
            if(err){
                console.log("err = "+err);
                reject(err)
            }
            resolve({pw:key.toString('base64'), salt})
        });
    })
}

exports.confirmPw = (pw, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(pw, salt, 10000, 64, 'sha512', (err, key) => {
            if(err){
                console.log("err = "+err);
                reject(err)
            }
            resolve(key.toString('base64'))
        });
    })
}
// 양방향 암호와
const { PASSWORD_SECRET: nearKey } = process.env;

exports.encryptAES = (text) => {
    const ciphertext = cryptoJS.AES.encrypt(text, nearKey);
    return ciphertext.toString();
};

exports.decryptAES = (text) => {
    let bytes = cryptoJS.AES.decrypt(text, nearKey);
    return bytes.toString(cryptoJS.enc.Utf8);
};