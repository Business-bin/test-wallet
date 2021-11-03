require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routers');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/', router);

app.use((req, res, next) => {
    res.status(404).send('요청한 페이지를 찾을 수 없습니다');
});

app.listen(6000, () => {
    console.log('Example app listening on port '+ 6000);
});