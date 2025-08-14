const mongoose = require("mongoose");

const caregiverProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bio: { type: String },
  profilePictureUrl: { type: String },
  yearsOfExperience: { type: Number },
  certifications: [{ type: String }],
  servicesOffered: [{ type: String }],
  hourlyRate: { type: Number },
});

module.exports = mongoose.model("CaregiverProfile", caregiverProfileSchema);
