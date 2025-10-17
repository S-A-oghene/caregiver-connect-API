const CaregiverProfile = require("../models/CaregiverProfile"); // Ensure this model exists
const User = require("../models/User"); // Assuming you have a User model
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

/**
 * @desc    Get all caregiver profiles
 * @route   GET /profiles
 * @access  Public
 */
const getAllProfiles = async (req, res, next) => {
  try {
    // #swagger.tags = ['Profiles']
    // #swagger.summary = 'Get all caregiver profiles'
    // Using .populate to include some user details in the profile listing
    const profiles = await CaregiverProfile.find({}).populate(
      "userId",
      "firstName lastName email"
    );
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single caregiver profile by their user ID
 * @route   GET /profiles/:id
 * @access  Public
 */
const getProfileById = async (req, res, next) => {
  try {
    // #swagger.tags = ['Profiles']
    // #swagger.summary = 'Get caregiver profile by user ID'
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

    const profile = await CaregiverProfile.findOne({
      userId: req.params.id,
    }).populate("userId", "firstName lastName email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new caregiver profile
 * @route   POST /profiles
 * @access  Private (Caregivers only)
 */
const createProfile = async (req, res, next) => {
  // Handle validation errors from the route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // #swagger.tags = ['Profiles']
    // #swagger.summary = 'Create caregiver profile'
    /* #swagger.requestBody = {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CaregiverProfile" } } }
    } */

    // Authorization: Check if the logged-in user has the 'caregiver' role
    if (req.user.role !== "caregiver") {
      return res.status(403).json({
        message:
          'Forbidden: Only users with the "caregiver" role can create a profile.',
      });
    }

    // Validation: Check if a profile already exists for this user
    const existingProfile = await CaregiverProfile.findOne({
      userId: req.user._id,
    });
    if (existingProfile) {
      return res.status(409).json({
        message: "Conflict: A caregiver profile already exists for this user.",
      });
    }

    const {
      bio,
      yearsOfExperience,
      certifications,
      servicesOffered,
      hourlyRate,
    } = req.body;

    const newProfile = new CaregiverProfile({
      userId: req.user._id, // Link to the authenticated user
      bio,
      yearsOfExperience,
      certifications,
      servicesOffered,
      hourlyRate,
    });

    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    // Catches both validation errors from Mongoose and general server errors
    next(error);
  }
};

/**
 * @desc    Update a caregiver's profile
 * @route   PUT /profiles/:id
 * @access  Private (Owner only)
 */
const updateProfile = async (req, res, next) => {
  // Handle validation errors from the route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // #swagger.tags = ['Profiles']
    // #swagger.summary = 'Update caregiver profile'
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

    // Authorization: Check if the logged-in user is the owner of the profile
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own profile." });
    }

    const updatedProfile = await CaregiverProfile.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a caregiver's profile
 * @route   DELETE /profiles/:id
 * @access  Private (Owner only)
 */
const deleteProfile = async (req, res, next) => {
  try {
    // #swagger.tags = ['Profiles']
    // #swagger.summary = 'Delete caregiver profile'
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid User ID format." });
    }

    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own profile." });
    }

    const result = await CaregiverProfile.deleteOne({ userId: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json({ message: "Profile deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
