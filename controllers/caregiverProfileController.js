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
