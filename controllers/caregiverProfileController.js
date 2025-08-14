const CaregiverProfile = require("../models/CaregiverProfile");
const { validationResult } = require("express-validator");

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await CaregiverProfile.find().populate("userId");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const profile = await CaregiverProfile.findOne({
      userId: req.params.id,
    }).populate("userId");
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const profile = new CaregiverProfile({ ...req.body, userId: req.user.id });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // Ownership Check: Ensure the user is updating their own profile.
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: You can only update your own profile." });
  }

  try {
    const profile = await CaregiverProfile.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    );
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    // Ownership Check: Ensure the user is deleting their own profile.
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own profile." });
    }

    const profile = await CaregiverProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    await profile.deleteOne();
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};