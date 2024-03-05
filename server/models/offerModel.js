const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const offerModel = mongoose.model('offers', offerSchema);
module.exports = offerModel;
