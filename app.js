const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Eureka = require('eureka-js-client').Eureka;
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
// app.use(cors());
app.use(bodyParser.json());

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './files'
});

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            version: "1.0.0",
            title: "Customer API",
            description: "Customer API Information",
            contact: {
                name: "Amazing Developer"
            },
            servers: ["http://localhost:8085"]
        }
    },
    // ['.routes/*.js']
    apis: ["app.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
 * @swagger
 * /upload:
 *    post:
 *      description: Upload file
 *    parameters:
 *      - name: files
 *        in: body
 *        description: Image file
 *        required: true
 *        schema:
 *          type: file
 *          format: file
 *    responses:
 *      '200':
 *        description: file name
 */
app.post('/upload/', multipartMiddleware, (req, res) => {
    if (!req.files)
        return res.status(500).json({ message: 'No file provided!' });
    return res.status(200).json(
        req
            .files
            .files
            .path
            .split('\\')[1]
    );
});

app.use('/upload/image', express.static('files'));

/**
 * @swagger
 * /image/{name}:
 *    get:
 *      description: Get image
 *    parameters:
 *      - name: name
 *        in: query
 *        description: Name of image
 *        required: true
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '200':
 *        description: image
 */
app.get('/image/:name', function (req, res, next) {
    const fileName = req.params.name;
    res.sendFile(fileName,{ root: './files' });
});

app.listen(8085);
console.log('App Connected !');

const client = new Eureka({
    instance: {
        app: 'upload-ms',
        hostName: '172.20.0.10',
        ipAddr: '172.20.0.10',
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
        host: '172.20.0.10',
        port: 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 2000,
    }
})
client.start( error => {
    console.log(error || "upload service registered")
});
