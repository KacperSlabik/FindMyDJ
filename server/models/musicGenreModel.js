const mongoose = require('mongoose');
const musicGenreSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const musicGenreModel = mongoose.model('music-genres', musicGenreSchema);
module.exports = musicGenreModel;
