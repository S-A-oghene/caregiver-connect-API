const Review = require("../models/Review");
const { validationResult } = require("express-validator");

exports.getReviewsForCaregiver = async (req, res, next) => {
  try {
    const reviews = await Review.find({ caregiverId: req.params.caregiverId });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const review = new Review({ ...req.body, clientId: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    let review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Ownership Check: Ensure the user owns the review
    if (review.clientId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only update your own reviews." });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(review);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Ownership Check: Ensure the user owns the review
    if (review.clientId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only delete your own reviews." });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
