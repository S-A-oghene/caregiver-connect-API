const express = require("express");
const { body, param } = require("express-validator");
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

const router = express.Router();

// All booking routes are protected
router.use(auth);

router.get("/", bookingController.getBookings);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid booking ID"),
  bookingController.getBookingById
);

router.post(
  "/",
  [
    body("caregiverId")
      .isMongoId()
      .withMessage("A valid caregiver ID is required"),
    body("date").isISO8601().toDate().withMessage("A valid date is required"),
    body("startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Start time must be in HH:MM format"),
    body("endTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("End time must be in HH:MM format"),
    body("notes").optional().isString(),
  ],
  bookingController.createBooking
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid booking ID"),
    body("status")
      .optional()
      .isIn(["pending", "confirmed", "completed", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  bookingController.updateBooking
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid booking ID"),
  bookingController.deleteBooking
);

module.exports = router;
