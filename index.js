const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hqma3.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;



const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;
app.use(express.static('service'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('hlw everyone')
  })


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");

  const review = client.db(`${process.env.DB_NAME}`).collection("review");
  const admin = client.db(`${process.env.DB_NAME}`).collection("adminPanel");
  const student = client.db(`${process.env.DB_NAME}`).collection("student");
  
  console.log('connected')

  app.post('/addService', (req, res) => {

    const service = req.body;
    console.log(service)
    serviceCollection.insertMany(service)
    .then(result => {
        console.log(result);
        res.send(result.insertedCount)
    })

})

    app.get('/services', (req, res) => {
        serviceCollection.find({})
        .toArray( (err, documents) =>{
        res.send(documents)
        })
    });


    app.get('/review', (req, res) => {
        review.find({})
          .toArray((err, documents) => {
            res.send(documents);
          })
        console.log(err)
        console.log('data loaded successfully')
      })

      app.get('/findAdmin', (req, res) => {
        console.log(req.query.email)
        admin.find({ email: req.query.email })
          .toArray((err, documents) => {
            res.send(documents)
          })
      })

      app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
        };
    
        serviceCollection.insertOne({ name, description, image })
          .then(result => {
            res.send(result.insertedCount > 0);
          })
      })

      app.get('/allStudent', (req, res) => {
        student.find({})
          .toArray((err, documents) => {
            res.send(documents);
          })
        console.log(err)
        console.log('customer loaded successfully')
      })
    
      app.post('/addStudent', (req, res) => {
        const fileOne = req.files.fileOne;
        const name = req.body.name;
        const email = req.body.email;
        const work = req.body.work;
        const details = req.body.details;
        const price = req.body.price;
        const status= req.body.status;
        const ClientImg = fileOne.data;
        const encImgClient = ClientImg.toString('base64');
    
        var image = {
          contentType: fileOne.mimetype,
          size: fileOne.size,
          img: Buffer.from(encImgClient, 'base64')
        };
        student.insertOne({ name, email, work, details, price,status,image })
          .then(result => {
            res.send(result.insertedCount > 0);
          })
      })
    
      app.get('/findStudent', (req, res) => {
        student.find({ email: req.query.email })
          .toArray((err, documents) => {
            res.send(documents)
          })
      })

      app.post('/addReview', (req, res) => {
        const newFeedback = req.body;
        console.log(newFeedback)
        review.insertOne(newFeedback)
          .then(result => {
            if (result.insertedCount > 0) {
              res.send(result)
            }
            console.log('Review done')
          })
    
      })

      app.post('/AddAdmin', (req, res) => {
        admin.insertOne(req.body)
          .then(result => {
            if (result.insertedCount > 0) {
              res.send(result)
            }
            console.log('admin added successfully')
          })
    
      })

      app.patch('/updateStatus/:id', (req, res) => {
        console.log(req.body)
        student.updateOne({ _id: ObjectId(req.params.id) },
          {
            $set: { status: req.body.updateStatus}
          }
        )
          .then(result =>{
            console.log('status updated successfully')
            console.log(result)
            res.send(result)
          })
      })  


});

app.listen(process.env.PORT || port);
