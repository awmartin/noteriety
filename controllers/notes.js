var Note = require('../models/Note');

var getAllNotes = function(req, res) {
  console.log("Getting all the notes in the database.");

  Note.find({}).exec(function(err, notes) {
    if (err) {
      console.error(err.toString());
      res.json([]);
    } else {
      console.log("Query successful. Returning", notes.length, "notes.");
      res.json(notes);
    }
  });
};

var getNote = function(req, res) {
  var onFind = function(err, note) {
    if (err) {
      res.status(500);
    } else {
      res.send(note);
    }
  };

  Note.findById(req.params.id, onFind);
};

var createNote = function(req, res) {
  console.log("Attempting to create a new note.");

  var newNote = new Note({
    title: "Untitled note",
    content: ""
  });

  var onComplete = function(err) {
    if (err) {
      console.error("Error creating a note", err.toString());
      res.status(500);
    } else {
      console.log("Successfully created note:", JSON.stringify(newNote));
      res.json(newNote);
    }
  };

  newNote.save(onComplete);
};

var updateNote = function(req, res) {
  console.log("Updating note", req.params.id, 'with', JSON.stringify(req.body));

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
        console.error("Error updating note", req.params.id, err.toString());
        res.status(500);
      } else {
        console.log("Successfully updated note", JSON.stringify(note));
        res.send(note);
      }
    })
  };

  Note.findById(req.params.id, onFind);
};

var deleteNote = function(req, res) {
  console.log("Deleting note", req.params.id);

  var id = req.params.id;
  var onRemove = function(err) {
    if (err) {
      console.error("Error while deleting note,", req.params.id, err.toString());
      res.status(500);
    } else {
      console.log("Successfully deleted note", req.params.id);
      res.json({
        _id: req.params.id
      });
    }
  };

  Note.remove({
    _id: id
  }, onRemove);
};

module.exports = {
  getAllNotes: getAllNotes,
  getNote: getNote,
  createNote: createNote,
  updateNote: updateNote,
  deleteNote: deleteNote
};
