const mongoose = require('mongoose');

const CV_uploadSchema = new mongoose.Schema({
    full_name: String,
    email: String,
    phone_number: String,
    location: String,
    sector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job_sector' 
      },
      job_title: String,
      experience_content: String,
      file: String,
 
  });
  
  module.exports = mongoose.model('CV_upload', CV_uploadSchema);