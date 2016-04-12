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
  onSave: function(event) {
    if (event) {
      event.preventDefault();
    }
    this.save(this.state);
  },

  save: function(state) {
    if (!state._id) { return; }

    var postData = {
      title: state.title.trim(),
      content: state.content.trim()
    };

    var onSuccess = function(data) {
      this.props.onUpdateNote(data);
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(status, err);
    }.bind(this);

    var url = '/api/notes/' + state._id;
    var method = 'PUT';

    $.ajax({
      url: url,
      method: method,
      dataType: 'json',
      data: postData,
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
      success: onSuccess,
      error: onError
    });
  },

  getInitialState: function() {
    return {
      title: '',
      content: '',
      _id: null
    };
  },

  saveIfNecessary: function() {
    if (!this.props.selectedNote) { return; }

    var savingTheCurrentNote = this.props.selectedNote._id === this.state._id;
    if (!savingTheCurrentNote) { return; }

    var changedTitle = this.state.title !== this.props.selectedNote.title;
    var changedContent = this.state.content !== this.props.selectedNote.content;
    if (changedTitle || changedContent) {
      this.save(this.state);
    }
  },

  componentDidMount: function() {
    setInterval(this.saveIfNecessary, 2000);
  },

  componentWillUpdate: function(nextProps, nextState) {
    // When we're switching notes, save the current one.
    if (!!nextProps.selectedNote && !!this.props.selectedNote) {
      if (nextProps.selectedNote._id !== this.props.selectedNote._id) {
        this.save(this.state);
      }
    }
  },

  componentWillReceiveProps: function(newProps) {
    // We don't know anything, so abort.
    if (!newProps.selectedNote && !this.props.selectedNote) { return; }

    // Loading a note from scratch.
    if (newProps.selectedNote && !this.props.selectedNote) {
      this.setState({
        title: newProps.selectedNote.title,
        content: newProps.selectedNote.content,
        _id: newProps.selectedNote._id
      });
      return;
    }

    // At this point, we've handled the cases in which we don't know the selected note. Abort.
    if (!this.props.selectedNote) { return; }

    // We're about to load a different note, so set the current state.
    if (newProps.selectedNote._id !== this.props.selectedNote._id) {
      this.setState({
        title: newProps.selectedNote.title,
        content: newProps.selectedNote.content,
        _id: newProps.selectedNote._id
      });
    }
  },

  render: function() {
    return (
      <form className="notes-form">
        <input
          type="text"
          placeholder="Untitled note"
          value={this.state.title || ''}
          onChange={this.onTitleChange}
          style={{width:'100%'}}
          disabled={!this.props.selectedNote}
        />

        <textarea
          type="text"
          placeholder="Details here."
          value={this.state.content || ''}
          onChange={this.onContentChange}
          style={{width:'100%'}}
          disabled={!this.props.selectedNote}
        />

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
    } else {
      this.onSelectNote(null);
    }
  },

  onSelectNote: function(noteId) {
    this.setState({
      selectedNoteId: noteId
    });
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
      data: {title: 'Untitled note', content: ''},
      success: onSuccess,
      error: onError
    });
  },

  getNote: function(noteId) {
    var selectedNote = null;
    for (var i=0, len=this.state.data.length; i<len; i++) {
      var note = this.state.data[i];
      if (note._id === noteId) {
        selectedNote = note;
        break;
      }
    }
    return selectedNote;
  },

  // When a note is updated, update the note in the given array of data, the set the state.
  onUpdateNote: function(note) {
    var noteIds = this.state.data.map(function(n){ return n._id; });
    var selectedNoteIndex = noteIds.indexOf(note._id);

    var updatedNotes = this.state.data;
    var isNewNote = selectedNoteIndex === -1;
    if (isNewNote) {
      updatedNotes = [note];
    } else {
      updatedNotes[selectedNoteIndex] = note;
    }

    this.setState({
      data: updatedNotes
    });

    if (isNewNote) {
      this.onSelectNote(note._id);
    }
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
