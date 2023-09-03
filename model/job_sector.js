const mongoose = require('mongoose');

const job_sectorSchema = new mongoose.Schema({
  name: { type: String},
});

module.exports = mongoose.model('Job_sector', job_sectorSchema);
