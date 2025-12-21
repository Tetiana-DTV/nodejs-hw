import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res) => {
  const { _id: userId } = req.user;

  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;
  const { tag, search } = req.query;


  const skip = (page - 1) * perPage;

  const notesQuery = Note.find({ userId });

  if (search?.trim()) {
    notesQuery.where({ $text: { $search: search } });
  }


  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalNotes / perPage);
res.status(200).json({
  page,
  perPage,
  totalNotes,
  totalPages,
  notes,
});
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;

  const note = await Note.findOne({ _id: noteId, userId });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }
  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const { _id: userId } = req.user;

  const note = await Note.create({
    ...req.body,
    userId,
  });

  res.status(201).json(note);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;

  const note = await Note.findOneAndUpdate({ _id: noteId, userId },
    req.body,
    { new: true }
  );

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).json(note);
};