const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')

// const admin = require('firebase-admin');


const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

//file upload
app.use(express.static('services'));
app.use(fileUpload())

// var serviceAccount = require("./haat-bazar-167f4-firebase-adminsdk-fdo36-41dc856ac2.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6pukr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//connect database
client.connect(err => {
    const serviceCollection = client.db(process.env.DB_NAME).collection('services');
    console.log('database connected');

    app.get('/allServices', (req, res) => {
        serviceCollection.find()
            .toArray((err, products) => {
                res.send(products)
            });
    })

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const price = req.body.price;
        const description = req.body.description;
        console.log(title, price, description, file);
        const filePath = `${__dirname}/services/${file.name}`;

        //move file to services folder
        file.mv(filePath, error => {
            if (error) {
                console.log(error);
            }
        })
        const newImage = fs.readFileSync(filePath);
        const encImage = newImage.toString('base64')
        const image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.alloc(req.files.file.size, encImage, 'base64')
        }

        serviceCollection.insertOne({ title, price, description })
            .then(result => {
                fs.remove(filePath, error => {
                    if (error) {
                        console.log(error);
                    }
                    res.send(result.insertedCount > 0)
                })


            })
    })

});




app.get('/', (req, res) => {
    res.send("server is running")
})
const port = 5000;
app.listen(process.env.PORT || port)