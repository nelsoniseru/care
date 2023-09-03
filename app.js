const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/users');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")
const session = require('express-session');
const flash = require('connect-flash');
const Sector = require('./model/job_sector');
const Category = require('./model/job_category');
const Cv = require('./model/upload_cv');

const app = express();
const port = process.env.PORT || 3000;

// ...

app.use(session({
  secret: 'mrnelson',
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser())

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
const seedUsers = [
  {
    email: 'admin@gmail.com',
    password: 'admin123456' // Plaintext password
  }
];

async function seedDatabase() {
  try {
    // Remove existing users before seeding (optional)
   // await User.deleteMany({});

    // Hash passwords and seed user data
    for (const seedUser of seedUsers) {
      const hashedPassword = await bcrypt.hash(seedUser.password, 10); // Hash the password
      const newUser = new User({
        email: seedUser.email,
        password: hashedPassword // Store the hashed password
      });
      await newUser.save();
    }

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the Mongoose connection
    mongoose.connection.close();
  }
}

// Call the seeding function
//seedDatabase();



function verifyToken(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect('/admin-auth/login');
  }

  jwt.verify(token, 'mrnelson', (err, decoded) => {
    if (err) {
      return res.redirect('/admin-auth/login');
    }
    req.user = decoded;
    next();
  });
}



const mongoURI = 'mongodb+srv://nelson:MgDbl8wB3qZtKnB9@cluster0.69zgn.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
    //source /home/noajjzgb/nodevenv/public_html/noaz/10/bin/activate && cd /home/noajjzgb/public_html/noaz
//https://cpanel-s340.web-hosting.com
// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Set up static folder
app.use(express.static('public'));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOCX files are allowed.'));
      }
    }
  })


// Routes
app.get('/', async(req, res) => {
  let sector = await Sector.find({})
res.render('home',{sector});
});
app.get('/upload-cv', async(req, res) => {
  let sector = await Sector.find({})
res.render('upload-cv',{sector});
});
app.get('/about', (req, res) => {
res.render('about');
});
app.get('/contact', (req, res) => {
res.render('contact');
});
app.get('/job-seekers', (req, res) => {
res.render('jobseekers');
});
app.get('/employers', (req, res) => {
res.render('employers');
});
app.get('/admin-auth/login', (req, res) => {
res.render('login');
});  
app.get('/dashboard',verifyToken, (req, res) => {
res.render('dashboard');
}); 
app.get('/create-category',verifyToken, async(req, res) => {
let  sector = await Sector.find({})

res.render('add_category',{sector});
});           
app.post('/upload', async(req, res) => {
    upload.single('file')(req, res, async(err) => {
         if (err instanceof multer.MulterError) {        
            req.flash('error_msg', 'A Multer error occurred when uploading.');
            return res.redirect("/upload-cv/")
          
         } else if (err) {
          req.flash('error_msg', err.message );
          return res.redirect("/upload-cv/")
         }
         let sect = await Sector.findOne({name:req.body.sector})
         await Cv.create({
      full_name:req.body.full_name,
      location:req.body.location,
      file:req.file?req.file.filename:"",
      email:req.body.email,
      phone_number:req.body.phone_number,
      sector:sect._id,
      job_title: req.body.job_title,
      experience_content: req.body.experience_content
    })
    req.flash('success_msg', "cv uploaded successfully" );

    return res.redirect("/upload-cv/")
  })
  });
  app.post('/login', async(req, res) => {   
    const user = await User.findOne({email:req.body.email});
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
  
    // Compare the provided password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
  
    if (!isPasswordCorrect) {
      return res.status(401).send('Invalid username or password');
    }
      const token = jwt.sign({ username: user.email }, 'mrnelson');
     res.cookie('jwt', token);
     res.redirect('/dashboard');
  })

  //category
  app.post('/create-category', async(req, res) => {
    let  sector = await Sector.findOne({name:req.body.sector})
    if(!sector){
      req.flash('error_msg', 'job sector name not found');
      return res.redirect("/create-category")
    }
    let findCategory = await Category.findOne({name:req.body.name})
    if(findCategory){
      req.flash('error_msg', 'job category name already exist');
      return res.redirect("/create-category")
    }
    await Category.create({name:req.body.name,sector:sector._id})
    req.flash('success_msg', 'job category name created successfully');
    return res.redirect("/create-category")

  })
  //sector
  app.post('/create-sector', async(req, res) => {
 let findSector = await Sector.findOne({name:req.body.name})
 if(findSector){
  req.flash('error_msg', 'name already exist');
 return res.redirect("/create-category")
 }
 await Sector.create(req.body)
 req.flash('success_msg', 'name created successfully');
 return res.redirect("/create-category")
})


//job
app.get('/create-job', async(req, res) => {
  let cat = await Category.findOne({})
  res.render("create-job",{cat})
 })
 
 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})