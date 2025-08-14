/*
// insert logic from routers

const User = require('../models/userModel');

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, clerkId } = req.body;
    const user = new User({ firstName, lastName, email, clerkId });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}       

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json({ message: 'Utente cancellato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

*/