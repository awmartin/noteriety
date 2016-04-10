var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

// Props: note, key
var Note = React.createClass({
  onSelectNote: function(event) {
    this.props.onSelectNote(this.props.note._id);
  },

  render: function() {
    return (
      <div className="note">
        <h3><a href="#" onClick={this.onSelectNote}>
          {this.props.note.title}
        </a></h3>
        <div>{this.props.note.content}</div>
      </div>
    )
  }
});

var NotesList = React.createClass({
  render: function() {
    var noteGenerator = function(note) {
      return (
        <Note note={note} key={note._id} onSelectNote={this.props.onSelectNote}></Note>
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
      console.log("Success", data);
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

  onTitleChange: function(e) {
    this.setState({title: e.target.value});
  },

  onContentChange: function(e) {
    this.setState({content: e.target.value});
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
      </form>
    )
  }
});

var NotesUI = React.createClass({
  getNotes: function() {
    var onSuccess = function(notesJson) {
      this.setState({data:notesJson});

      if (notesJson.length > 0) {
        var firstNote = notesJson[0];
        this.onSelectNote(firstNote._id);
      }
    }.bind(this);

    var onError = function(xhr, status, err) {
      console.error(this.props.url, status, err.toString());
    }.bind(this);

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: onSuccess,
      error: onError
    });
  },

  onNewNote: function(event) {
    var onSuccess = function(data) {
      var newNotes = this.state.data.concat(data);
      this.setState({
        data: newNotes
      });
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
    console.log("NotesUI.render");

    var selectedNote = this.getNote(this.state.selectedNoteId);

    return (
      <div className="row notes-ui">
        <div className="four columns">
          <a href="#" className="new-note-button" onClick={this.onNewNote}>New Note</a>
          <h2>Notes</h2>

          <NotesList data={this.state.data} onSelectNote={this.onSelectNote} />
        </div>

        <div className="eight columns">
          <NotesForm url="/api/notes" selectedNote={selectedNote} onUpdateNote={this.onUpdateNote} />
        </div>
      </div>
    )
  }
});

ReactDOM.render(
  <NotesUI url="/api/notes" />,
  document.getElementById('notes')
);
