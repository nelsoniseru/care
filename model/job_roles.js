const mongoose = require('mongoose');

const Job_roleSchema = new mongoose.Schema({
    name: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job_category' 
    }
  });
  
  module.exports = mongoose.model('Job_role', Job_roleSchema);