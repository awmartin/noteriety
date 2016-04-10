var express = require('express');
var path = require('path');
var mongoose = require('mongoose');

var notesController = require('./controllers/notes');

var app = express();

mongoose.connect('mongodb://localhost'); //process.env.MONGODB || process.env.MONGOLAB_URI);
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



// ---------------------------------------------------------------------------------------
// App Routes
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/api/notes', notesController.getAllNotes);
app.get('/api/notes/:id', notesController.getNote);
// ---------------------------------------------------------------------------------------


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
