const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Eureka = require('eureka-js-client').Eureka;

const app = express();
// app.use(cors());
app.use(bodyParser.json());

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './files'
});

app.post('/upload/', multipartMiddleware, (req, res) => {
    if (!req.files) {
        return res.status(200).json({ message: 'No file provided!' });
    }
    console.log(req.files);
    res.json({
        'message': 'File uploaded succesfully.',
        'name': req.files.uploads[0].path.split("\\")[1]
    });
});

app.use('/upload/image', express.static('files'));
app.get('/image/:name', function (req, res, next) {
    const fileName = req.params.name;
    res.sendFile(fileName,{ root: './files' });
});

app.listen(8085);
console.log('App Connected !');

const client = new Eureka({
    instance: {
        app: 'upload-ms',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
            '$': 8085,
            '@enabled': 'true',
        },
        vipAddress: 'upload-ms',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        // eureka server host / port
        host: 'localhost',
        port: 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 2000,
    }
})

client.start( error => {
    console.log(error || "upload service registered")
});
