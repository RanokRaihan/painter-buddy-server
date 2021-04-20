const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const ObjectId = require('mongodb').ObjectId;




const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }))




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6pukr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//connect database

client.connect(err => {
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");
    const testimonialCollection = client.db(process.env.DB_NAME).collection("testimonials");
    const adminCollection = client.db(process.env.DB_NAME).collection("admins");
    const allBookings = client.db(process.env.DB_NAME).collection("allBookings");
    console.log('Connected');

    //load all service
    app.get('/allServices', (req, res) => {
        serviceCollection.find()
            .toArray((err, document) => {
                res.send(document)
            });
    });

    //load latest three service
    app.get('/highlightServices', (req, res) => {
        serviceCollection.find().sort({ _id: -1 }).limit(4)
            .toArray((err, document) => {
                res.send(document)
            });
    })

    //load all review
    app.get('/allReviews', (req, res) => {
        testimonialCollection.find().sort({ _id: -1 })
            .toArray((err, document) => {
                res.send(document)
            });
    })

    //load latest reviews
    app.get('/highlightedReviews', (req, res) => {
        testimonialCollection.find().sort({ _id: -1 }).limit(3)
            .toArray((err, document) => {
                res.send(document)
            });
    })

    //get single service 
    app.get('/singleService/:id', (req, res) => {
        console.log(req.params.id);
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document)
            });

    })
    //varify admin
    app.get('/varifyAdmin/:email', (req, res) => {
        const adminEmail = req.params.email;
        adminCollection.find({ admin: adminEmail })
            .toArray((err, document) => {
                if (document.length > 0) {
                    res.send(true)
                }
                else {
                    res.send(false)
                }

            });

    })

    //load user based order data 
    app.get('/userOrder/:email', (req, res) => {
        const email = req.params.email;
        allBookings.find({ email: email })
            .toArray((err, document) => {
                res.send(document)
            });

    })

    //single booking
    app.get('/singleBooking/:id', (req, res) => {

        allBookings.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document)
            });
    })


    //load all order
    app.get('/allOrder', (req, res) => {
        allBookings.find()
            .toArray((err, document) => {
                res.send(document)
            });

    })


    //add review

    app.post('/addReview', (req, res) => {
        const review = req.body;
        console.log("review:", review);
        testimonialCollection.insertOne(review)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    //update status of a order
    app.patch('/updateStatus/:id', (req, res) => {
        console.log(req.params.id, req.body);
        allBookings.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: req.body
            })
            .then(result => {
                console.log('modified:' + result.modifiedCount);
                res.send('modified:' + result.modifiedCount)
            })

    })

    //make new Admin

    app.post('/makeAdmin', (req, res) => {
        const admin = req.body;
        console.log("admin:", admin);
        adminCollection.insertOne(admin)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })


    //add a service

    app.post('/addAService', (req, res) => {
        const service = req.body;
        console.log("service:", service);
        serviceCollection.insertOne(service)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })

    })

    //book a service

    app.post('/placeOrder', (req, res) => {
        const service = req.body;
        allBookings.insertOne(service)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })

    })

    //delete a service
    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        console.log(id);
        serviceCollection.deleteOne({ _id: id })
            .then(document => res.send('One Service Deleted'))
    })


});


//check the server is running or not

app.get('/', (req, res) => {
    res.send('server is running')
})
// console.log(process.env.DB_USER);

const port = 5000;
app.listen(process.env.PORT || port)