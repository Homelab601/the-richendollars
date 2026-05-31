import { useEffect, useState } from "react";

const API_URL = "";

export default function FridgeNotes({ socket }) {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetchNotes();

    socket.on("fridgeNotesUpdated", (updatedNotes) => {
      setNotes([...updatedNotes].reverse());
    });

    return () => {
      socket.off("fridgeNotesUpdated");
    };
  }, [socket]);

  async function fetchNotes() {
    try {
      const res = await fetch(`${API_URL}/fridge-notes`);
      const data = await res.json();
      setNotes([...data].reverse());
    } catch (err) {
      console.error("Failed to fetch fridge notes:", err);
    }
  }

  async function addNote(e) {
    e.preventDefault();

    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      text: noteText,
      createdAt: new Date().toLocaleString(),
    };

    try {
      await fetch(`${API_URL}/fridge-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      setNoteText("");
    } catch (err) {
      console.error("Failed to add fridge note:", err);
    }
  }

  async function deleteNote(id) {
    try {
      await fetch(`${API_URL}/fridge-notes/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete fridge note:", err);
    }
  }

  return (
    <div className="fridge-wrap">
      <div className="fridge-note-pad">
        <div className="fridge-note-header">
          <span className="magnet red"></span>
          <div>
            <h2>Family Fridge Notes</h2>
            <p>Quick reminders for the house</p>
          </div>
          <span className="magnet blue"></span>
        </div>

        <form className="fridge-form" onSubmit={addNote}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write a fridge note..."
          />

          <button className="gold-button">Stick Note</button>
        </form>

        <div className="fridge-notes-list">
          {notes.length === 0 ? (
            <p className="fridge-empty">No fridge notes yet.</p>
          ) : (
            notes.map((note) => (
              <div className="fridge-note" key={note.id}>
                <p>{note.text}</p>

                <div className="fridge-note-footer">
                  <small>{note.createdAt}</small>

                  <button onClick={() => deleteNote(note.id)}>
                    Toss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}