var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

// Props: note, [key], onSelectNote, isSelected
var Note = React.createClass({
  onSelectNote: function(event) {
    this.props.onSelectNote(this.props.note._id);
  },

  render: function() {
    var className = 'note';
    if (this.props.isSelected) {
      className += ' selected';
    }
    return (
      <div className={className}>
        <h3>
          <a href="#" onClick={this.onSelectNote}>
            {this.props.note.title}
          </a>
        </h3>
      </div>
    )
  }
});

// Props: data, selectedNote, onSelecteNote
var NotesList = React.createClass({
  render: function() {
    var noteGenerator = function(note) {
      var isSelected = false;
      if (this.props.selectedNote) {
        isSelected = note._id === this.props.selectedNote._id;
      }

      return (
        <Note note={note} key={note._id} onSelectNote={this.props.onSelectNote} isSelected={isSelected}></Note>
      )
    }.bind(this);

    var notes = this.props.data.map(noteGenerator);

    return (
      <div className="notes-list">
        {notes}
      </div>
    )
  }
});

// Props: selectedNote, onSelectNote, onDeleteNote
var NotesForm = React.createClass({
  onSubmit: function(event) {
    event.preventDefault();

    var title = (this.state.title || this.props.selectedNote.title);
    var content = (this.state.content || this.props.selectedNote.content);
    var postData = {
      title: title.trim(),
      content: content.trim()
    };

    var onSuccess = function(data) {
      this.props.onUpdateNote(data);
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(status, err);
    }.bind(this);

    $.ajax({
      url: '/api/notes/' + this.props.selectedNote._id,
      method: 'POST',
      dataType: 'json',
      data: postData,
      cache: false,
      success: onSuccess,
      error: onError
    });
  },

  onTitleChange: function(event) {
    this.setState({title: event.target.value});
  },

  onContentChange: function(event) {
    this.setState({content: event.target.value});
  },

  onDeleteNote: function(event) {
    event.preventDefault();
    var id = this.props.selectedNote._id;

    var onSuccess = function(data) {
      this.props.onDeleteNote({_id: id});
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(status, err);
    }.bind(this);

    $.ajax({
      url: '/api/notes/' + id,
      method: 'DELETE',
      dataType: 'json',
      cache: false,
      success: onSuccess,
      error: onError
    });
  },

  getInitialState: function() {
    return {
      title: null,
      content: null
    };
  },

  componentWillReceiveProps: function(props) {
    if (props.selectedNote) {
      this.setState({
        title: props.selectedNote.title,
        content: props.selectedNote.content
      });
    }
  },

  render: function() {
    return (
      <form className="notes-form" onSubmit={this.onSubmit}>
        <input
          type="text"
          placeholder="Untitled note"
          value={this.state.title || ''}
          onChange={this.onTitleChange}
          style={{width:'100%'}}
        />

        <textarea
          type="text"
          placeholder="Details here."
          value={this.state.content || ''}
          onChange={this.onContentChange}
          style={{width:'100%'}}
        />

        <input type="submit" value="Save" />
        <a href="#" onClick={this.onDeleteNote} className="delete-note-button">Delete</a>
      </form>
    )
  }
});

var NotesUI = React.createClass({
  getNotes: function() {
    var onSuccess = function(notesJson) {
      this.setState({data:notesJson});
      this.selectFirstNote();
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(status, err.toString());
    }.bind(this);

    $.ajax({
      url: '/api/notes',
      dataType: 'json',
      cache: false,
      success: onSuccess,
      error: onError
    });
  },

  selectFirstNote: function() {
    if (this.state.data.length > 0) {
      var firstNote = this.state.data[0];
      this.onSelectNote(firstNote._id);
    }
  },

  onNewNote: function(event) {
    event.preventDefault();

    var onSuccess = function(data) {
      var newNotes = this.state.data.concat(data);
      this.setState({
        data: newNotes
      });
      this.onSelectNote(data._id);
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(status, err.toString());
    }.bind(this);

    $.ajax({
      url: '/api/notes',
      method: 'POST',
      success: onSuccess,
      error: onError
    });
  },

  onSelectNote: function(noteId) {
    this.setState({
      selectedNoteId: noteId
    });
  },

  getNote: function(noteId) {
    var selectedNote = null;
    for (var i=0, len=this.state.data.length; i<len; i++) {
      var note = this.state.data[i];
      if (note._id == noteId) {
        selectedNote = note;
        break;
      }
    }
    return selectedNote;
  },

  onUpdateNote: function(note) {
    var noteIds = this.state.data.map(function(n){ return n._id; });
    var selectedNoteIndex = noteIds.indexOf(note._id);

    var updatedNotes = this.state.data;
    updatedNotes[selectedNoteIndex] = note;

    this.setState({
      data: updatedNotes
    });
  },

  onDeleteNote: function(note) {
    var noteIds = this.state.data.map(function(n){ return n._id; });
    var deletedNoteIndex = noteIds.indexOf(note._id);

    var left = this.state.data.slice(0, deletedNoteIndex);
    var right = this.state.data.slice(deletedNoteIndex + 1);
    var updatedNotes = left.concat(right);

    this.setState({
      data: updatedNotes
    });
    this.selectFirstNote();
  },

  getInitialState: function() {
    return {
      data: [],
      selectedNoteId: null
    };
  },

  componentDidMount: function() {
    this.getNotes();
  },

  render: function() {
    var selectedNote = this.getNote(this.state.selectedNoteId);

    return (
      <div className="row notes-ui">
        <div className="four columns">
          <div className="notes-list-header">
            <a href="#" className="new-note-button" onClick={this.onNewNote}>New Note</a>
            <h2>Notes</h2>
          </div>

          <NotesList data={this.state.data} selectedNote={selectedNote} onSelectNote={this.onSelectNote} />
        </div>

        <div className="eight columns">
          <NotesForm selectedNote={selectedNote} onUpdateNote={this.onUpdateNote} onDeleteNote={this.onDeleteNote} />
        </div>
      </div>
    )
  }
});

ReactDOM.render(
  <NotesUI />,
  document.getElementById('notes')
);
