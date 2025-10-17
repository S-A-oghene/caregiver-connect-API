const CaregiverProfile = require("../models/CaregiverProfile");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

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
    // Add validation for the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

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
    // Authorization: Check if the logged-in user has the 'caregiver' role as per the proposal
    if (req.user.role !== "caregiver") {
      return res.status(403).json({
        message:
          'Forbidden: Only users with the "caregiver" role can create a profile.',
      });
    }

    // Validation: Check if a profile already exists for this user
    const existingProfile = await CaregiverProfile.findOne({
      userId: req.user.id,
    });
    if (existingProfile) {
      return res.status(409).json({
        message: "Conflict: A caregiver profile already exists for this user.",
      });
    }

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

  // Add validation for the ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid User ID format." });
  }

  // Ownership Check: Ensure the user is updating their own profile.
  if (req.params.id !== req.user.id.toString()) {
    return res
      .status(403)
      .json({ error: "Forbidden: You can only update your own profile." });
  }

  try {
    const profile = await CaregiverProfile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: req.body },
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
    // Add validation for the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

    // Ownership Check: Ensure the user is deleting their own profile.
    if (req.params.id !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only delete your own profile." });
    }

    const result = await CaregiverProfile.deleteOne({ userId: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
