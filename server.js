var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var notesController = require('./controllers/notes');

var app = express();

mongoose.connect('mongodb://localhost/notoriety'); //process.env.MONGODB || process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


app.set('port', (process.env.PORT || 3000));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// ---------------------------------------------------------------------------------------
// App Routes
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/api/notes', notesController.getAllNotes);
app.get('/api/notes/:id', notesController.getNote);
app.post('/api/notes', notesController.createNote);
app.post('/api/notes/:id', notesController.updateNote);
// ---------------------------------------------------------------------------------------


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
