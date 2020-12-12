const path = require('path');
const fs = require('fs');

const express = require('express');
const sslRedirect = require('heroku-ssl-redirect').default
const mongoose = require('mongoose');
const sgmail = require('@sendgrid/mail');
const multer  = require('multer');

// routes
const academy = require('./routes/academy');
const blog = require('./routes/blog');
const about = require('./routes/about');

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const options = {
   root: path.join(__dirname, 'public')
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(sslRedirect(['production'], 301));

const companyEmail = "eptadigitalinfo@gmail.com";
sgmail.setApiKey(process.env.SGMAIL_API_KEY);
sgmail.setSubstitutionWrappers('{{', '}}');

fs.access("./uploads", (err) => {
   if (err)
      fs.mkdir("./uploads", (err) => {
         if (err) throw err;
      });
});

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
const ideaBrieFormSchema = new Schema({
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

const ideaBrieForm = mongoose.model('IdeaBrief', ideaBrieFormSchema);

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
app.post('/services/getting-started/submit', upload.single('attachFile'), async(req, res) => {
   try {
      const form = req.body;
      const attachment = req.file ? req.file.path : "";
      form.attachFile = attachment;
      const newForm = new ideaBrieForm(form);
      console.log(form);
      if(!newForm) {
         res.status(400);
         return res.send('Error')
      }

      const msg = [
         {
            to: form.emailAddr,
            from: `Epta Digital Agency <${companyEmail}>`,
            templateId: 'd-a0ba396a10ac444daba5688a04b87141',
            dynamic_template_data: {emailAddr: form.emailAddr}
         },
         {
            to: companyEmail,
            from: companyEmail,
            templateId: "d-f0481f35c55d487f84d83ae2bc0345bd",
            dynamic_template_data: {...form}
         }
      ];

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
// app.use((req, res, next) => {
//    const error = new Error('Not found!')
//    error.status = 404
//    next(error)
// })

//Error handler
app.use((error, req, res, next) => {
   res.status(error.status || 500)
   res.json({
       error: {
           message: error.message
       }
   })
})

app.use('(/[\\w-]+)+/stylesheets/:style(\\w+[.]css)', function (req, res) {
   res.sendFile('./stylesheets/' + req.params['style'], options);
});

app.use('(/[\\w-]+)+/images(/\\w+){0,}/:img', function (req, res) {
   const index = req.originalUrl.search("/images/");
   const imgPath = req.originalUrl.slice(index).slice(7);
   res.sendFile('./images/' + imgPath, options);
});

app.use('(/[\\w-]+)+/javascripts(/\\w*){0,}/:js(\\w+[.]min[.]js)', function (req, res) {
   res.sendFile('./javascripts/min/' + req.params['js'], options);
});

app.use('/academy', academy);
app.use('/blog', blog);
app.use('/about', about);

app.get('/services', function (req, res) {
   res.redirect(301, '/#services');
});

app.get('/services/getting-started', function (req, res) {
   res.sendFile('ideabrief.html', options);
});

//Set up port listener
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`App running on port ${PORT}`);
})
