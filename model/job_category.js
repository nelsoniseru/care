const mongoose = require('mongoose');

const Job_categorySchema = new mongoose.Schema({
    name: String,
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job_sector' 
    }
  });
  
  module.exports = mongoose.model('Job_category', Job_categorySchema);