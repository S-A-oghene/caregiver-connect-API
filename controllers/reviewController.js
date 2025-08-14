const Review = require("../models/Review");
const { validationResult } = require("express-validator");

exports.getReviewsForCaregiver = async (req, res) => {
  try {
    const reviews = await Review.find({ caregiverId: req.params.caregiverId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const review = new Review({ ...req.body, clientId: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
