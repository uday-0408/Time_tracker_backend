import WorkNote from '../models/WorkNote.js';
/**
 * NotesService handles all business logic for contextual work notes.
 * Notes are always tied to a work context (session or day) — never free-floating.
 */
export class NotesService {
    /**
     * Create a new note linked to a session or day.
     * Enforces user ownership by storing userId on every note.
     */
    static async createNote(userId, linkedType, referenceId, content) {
        const note = await WorkNote.create({
            userId,
            linkedType,
            referenceId,
            content,
            versions: [], // first creation — no previous versions yet
        });
        return note;
    }
    /**
     * Update a note's content. The previous content is pushed onto the
     * versions array so every edit is preserved for audit.
     */
    static async updateNote(noteId, userId, newContent) {
        const note = await WorkNote.findOne({ _id: noteId, userId, isDeleted: false });
        if (!note)
            throw new Error('Note not found or access denied');
        // Preserve current content as a version before overwriting
        note.versions.push({
            content: note.content,
            editedAt: new Date(),
        });
        note.content = newContent;
        await note.save();
        return note;
    }
    /**
     * Fetch notes for a given context (SESSION or DAY).
     * Only returns notes belonging to the requesting user and not soft-deleted.
     */
    static async getNotes(userId, linkedType, referenceId) {
        return WorkNote.find({
            userId,
            linkedType,
            referenceId,
            isDeleted: false,
        }).sort({ createdAt: -1 });
    }
    /**
     * Soft-delete: marks the note as deleted without losing data.
     * The note and its version history remain in the database for compliance.
     */
    static async deleteNote(noteId, userId) {
        const note = await WorkNote.findOne({ _id: noteId, userId });
        if (!note)
            throw new Error('Note not found or access denied');
        note.isDeleted = true;
        await note.save();
        return note;
    }
}
