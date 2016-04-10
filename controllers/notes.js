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

var createNote = function(req, res) {
  var newNote = new Note({
    title: "Untitled note",
    content: ""
  });

  var onComplete = function(err) {
    if (err) {
      console.error(err);
      res.status(500);
    } else {
      res.json(newNote);
    }
  };

  newNote.save(onComplete);
};

var updateNote = function(req, res) {
  var onFind = function(err, note) {
    if (err) {
      res.status(500);
      return;
    }

    if (req.body.title) {
      note.title = req.body.title;
    }
    if (req.body.content) {
      note.content = req.body.content;
    }

    note.save(function(err) {
      if (err) {
        res.status(500);
      } else {
        res.send(note);
      }
    })
  };

  Note.findById(req.params.id, onFind);
};

module.exports = {
  getAllNotes: getAllNotes,
  getNote: getNote,
  createNote: createNote,
  updateNote: updateNote
};
