var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({
  title: String,
  content: String
});

var Note = mongoose.model('Note', noteSchema);

module.exports = Note;
