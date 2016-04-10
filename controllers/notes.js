var Note = require('../models/Note');

var getAllNotes = function(req, res) {
  Note.find({}).exec(function(err, notes) {
    if (err) {
      console.error(err);
      res.json([]);
    } else {
      res.json(notes);
    }
  });
};

var getNote = function(req, res) {
  res.json({
    id: req.params.id
  });
};

module.exports = {
  getAllNotes: getAllNotes,
  getNote: getNote
};
