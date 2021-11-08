const mysql = require('mysql2/promise');
// mysql은 callback기반이라 promise 사용 못함(promise-mysql 따로 설치해야 함)
const connection = {
    host: 'localhost',
    user: 'root',
    password: process.env.db_pw,
    database: 'wallet-sample'
};
const DB = {};
// 데이터베이스에 연결된 connection을 미리 만들어 둔 후 Pool에 보관하였다가 필요할 때 Pool에서 Connection을 가져다 사용한 후, 다시 Pool에 반환하는 기법
// Connection Pool을 이용하면 여러 Connection을 이용할 수 있기 때문에 더 큰 부하를 견딜 수 있다
// 기존처럼 필요할때 마다 Connection을 생성하고 닫지 않아도 되기 때문에 어플리케이션의 성능향상 또한 기대할 수 있다
DB.conn = mysql.createPool(connection);

DB.getUserInfo = async(email) => {
    const sql =   "SELECT * " +
        "  FROM USER_INFO " +
        "  WHERE USER_EMAIL = ? ";
    var params = [email];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
}

DB.setUserInfo = async(email, pwd, name, mnemonic, addr, pri_key, pub_key, salt) => {
    const sql =   "INSERT INTO USER_INFO (USER_EMAIL, USER_PWD, USER_NM, USER_MNEMONIC, USER_WALLET_ADDR, USER_WALLET_PRIK, USER_WALLET_PUBK, SALT, REG_DTTM) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    const params = [
        email,
        pwd,
        name,
        mnemonic,
        addr,
        pri_key,
        pub_key,
        salt
    ];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
}

DB.setTxInfo = async(email,tx) => {
    const sql =   "INSERT INTO TX_INFO (USER_EMAIL, TX, REG_DTTM) " +
        "VALUES (?, ?, NOW())";
    const params = [
        email,
        tx
    ];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
}


DB.getTxInfo = async(email) => {
    const sql =   "SELECT * " +
        "  FROM TX_INFO " +
        "  WHERE USER_EMAIL = ? " +
        "  ORDER BY REG_DTTM DESC ";
    const params = [email];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
}

module.exports = DB;
//
// connection.connect();
// connection.query('SELECT * FROM USER_INFO', function (error, results, fields) {
//     if (error) {
//         console.log(error);
//     }
//     console.log(results);
// });
//
// connection.end();
// exports.connect_mysql =  () => {
//     const connection = mysql.createConnection({
//         host     : 'localhost',
//         user     : 'root',
//         password : process.env.db_pw,
//         database : 'wallet-sample'
//     });
//     connection.connect( (err) => {
//         if (err) {
//             console.error('mysql connection error :' + err);
//         } else {
//             console.info('mysql is connected successfully.');
//         }
//     })
// };