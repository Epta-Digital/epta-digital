const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const sgmail = require('@sendgrid/mail');
const multer  = require('multer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

sgmail.setApiKey(process.env.SGMAIL_API_KEY);

//Mongo setup
const db_url = process.env.MONGO_URI;
mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.once('open', () => {
   console.log('mongodb connected')
})

db.on('error', err => {
   throw new Error(err);
})

//model
const Schema = mongoose.Schema;

const formSchema = new Schema({
   company: {
      type: String,
      required: [ true, 'Company field is required']
   },
   email: {
      type: String,
      required: [ true, 'Email is required']
   },
   mobile: {
      type: Number,
      required: [true, 'Mobile is required']
   },
   services: [{
      type: String,
      enum: ['graphics design', 'ui/ux', 'photography/videography', 'copywriting/contentWriting', 'web development', 'Animations', 'brand strategy/consultancy'],
      required: true
   }],
   budget: {
      type: String,
      required: true
   },
   dateofdelivery: {
      type: Date
   },
   brief: {
      type: String
   },
   attachFile: {
      type: String
   }
})

const Form = mongoose.model('form', formSchema);

//Multer storage
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(  
         null, 
         `${file.fieldname}-${new Date().toISOString().replace(/:/g, '-')}-${file.originalname.replace(/ /g, '-')}`
      )
    }
 })
  
const upload = multer({ storage })

//Form handler
app.post('/form', upload.single('attachFile'), async(req, res) => {
   try {
      const form = req.body;
      const attachment = req.file.path;
      form.attachFile = attachment;
      const newForm = new Form(form);
      console.log(form);
      if(!newForm) {
         res.status(400);
         return res.send('Error')
      }
      const msg = {
         to: form.email,
         from: 'eptadigitalinfo@gmail.com',
         subject: 'Testing Email Sending',
         html: `<h2>Thanks for contacting us</h2>
               <br>
               <p>We've received your feedback(below) and we are working on it right away</p>
               <br>
               Company: ${form.company}<br>Email: ${form.email}<br>phone: ${form.mobile}<br>budget: ${form.budget}<br>dateOfDelivery: ${form.dateofdelivery}`
      }
      const sendMail = await sgmail.send(msg);
      if(!sendMail) {
            res.status(400);
         throw new Error('Error sending mail');
      }

      await newForm.save();
      res.send('Form saved & Email sent')
   } catch (err) {
      throw new Error(err);
   }
})

//Not found - 404 errorsS
app.use((req, res, next) => {
   const error = new Error('Not found!')
   error.status = 404
   next(error)
})

//Error handler
app.use((error, req, res, next) => {
   res.status(error.status || 500)
   res.json({
       error: {
           message: error.message
       }
   })
})

//Set up port listener
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
   console.log(`App running on port ${PORT}`);
})
