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
sgmail.setSubstitutionWrappers('{{', '}}');

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
   companyName: {
      type: String,
      required: [ true, 'Company field is required']
   },
   emailAddr: {
      type: String,
      required: [ true, 'Email is required']
   },
   mobileNo: {
      type: String,
      required: [true, 'Mobile is required']
   },
   services: [{
      type: String,
      enum: ['design', 'ui-ux', 'photography', 'contentWriting', 'webDev', 'animations', 'brandStrategy', 'basicPkg', 'standardPkg', 'premiumPkg'],
      required: true
   }],
   budget: {
      type: String,
      required: true
   },
   dateOfDelivery: {
      type: Date
   },
   brief: {
      type: String,
      required: true
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
      const attachment = req.file ? req.file.path : "";
      form.attachFile = attachment;
      const newForm = new Form(form);
      console.log(form);
      if(!newForm) {
         res.status(400);
         return res.send('Error')
      }
      const msg = {
         to: form.emailAddr,
         from: 'eptadigitalinfo@gmail.com',
         templateId: 'd-a0ba396a10ac444daba5688a04b87141',
         dynamic_template_data: {emailAddr: form.emailAddr}
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`App running on port ${PORT}`);
})
