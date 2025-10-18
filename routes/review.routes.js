const express = require("express");
const { body, param } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get(
  "/caregiver/:caregiverId",
  param("caregiverId").isMongoId().withMessage("Invalid caregiver ID"),
  reviewController.getReviewsForCaregiver
);

// All POST/PUT/DELETE routes are protected
router.use(auth);

router.post(
  "/",
  [
    body("bookingId").isMongoId().withMessage("A valid booking ID is required"),
    body("caregiverId")
      .isMongoId()
      .withMessage("A valid caregiver ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be an integer between 1 and 5"),
    body("comment").optional().isString(),
  ],
  reviewController.createReview
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid review ID"),
    body("rating").optional().isInt({ min: 1, max: 5 }),
    body("comment").optional().isString(),
  ],
  reviewController.updateReview
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid review ID"),
  reviewController.deleteReview
);

module.exports = router;
