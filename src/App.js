import React, {useEffect} from 'react';
import './App.css';
import dexie from 'dexie';

const titleLength = 64;
const bodyLength = 200;

const db = new dexie('TypNote');
db.version(7).stores({notes: '++id, title, body'});

function App() {
    // Input fields' state
    const [note, setNote] = React.useState({
        title: "",
        body: "",
    });

    // Set state from input fields
    const insertNote = (prop) => (event) => {
        setNote({ ...note, [prop]: event.target.value });
    };

    // All Notes
    const [notes, setNotes]= React.useState("");

    // Get notes from database and put into state
    const getNotes = async () => {
        // get all notes sorted by id       // (old first)
        let allNotes = await db.notes.orderBy('id').toArray();
        // set state
        setNotes(allNotes);
    };

    // Empty Error state
    const [err, setErr] = React.useState(false);

    // Show error if submit button is clicked on blank fields
    const showBlankErr = () => {
        if (err) {
            return <p className='err'>Both the fields, please</p>
        }
        return <React.Fragment/>
    };

    // Function to delete note
    const deleteNote = async(id) => {
        db.notes.delete(id);
        let allNotes = await db.notes.toArray();
        setNotes(allNotes);
    };

    // Number of notes
    const getNotesNum = () => {
            if (notes.length === 1) {
                return "1 Typ";
            }
            return notes.length + " Typs";
    };

    // Typ button submit
    const handleSubmit = () => {
        // Check if inputs are blank
        if (note.title === "" || note.body === "") {
            setErr(true);
            console.log("Blank fields are not allowed");
        } else {
            // Hide Error
            setErr(false);

            // Object to push into database
            const noteObj = {title: note.title, body: note.body};

            db.notes.add(noteObj).then(async() => {
                await getNotes();
            });

            // Update input fields to blank
            setNote({
                title: "",
                body: "",
            });
        }
    };

    // Update state on every re-render
    useEffect(() => {
        getNotes();
    }, []);

    // Render all notes
    const allNotes = () => {
        if (notes.length > 0) {
            return <div className='notes'>
                {
                    notes.map(note => {
                        return <div className='note' key={note.id}>
                            <h3>{note.title}</h3>
                            <button onClick={() => deleteNote(note.id)}>x</button>
                            <hr/>
                            <p>{note.body}</p>
                        </div>
                    })
                }
            </div>
        }
        return <React.Fragment/>
    };

    return <div className='App'>
        <div className="header">
            <div className='header_in'>
                <h1>TypNote</h1>
                <h5>{ getNotesNum() }</h5>
            </div>
        </div>
        <div className='blank'></div>
        <div className='input'>
            <input type='text' name='title' value={note.title} onChange={insertNote('title')} placeholder=' Title' autoComplete="off" maxLength={titleLength} required />
            <input type='text' name='body' value={note.body} onChange={insertNote('body')} placeholder=' Body' autoComplete="off" maxLength={bodyLength} required />
            <button name='submit' onClick={handleSubmit} className='submitbtn'>Typ</button>
            { showBlankErr() }
        </div>
        { allNotes() }
	</div>
}

export default App;
