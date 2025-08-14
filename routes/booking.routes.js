const express = require("express");
const { body } = require("express-validator");
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, bookingController.getBookings);
router.get("/:id", auth, bookingController.getBookingById);
router.post(
  "/",
  auth,
  [
    body("caregiverId").isString(),
    body("date").isISO8601(),
    body("startTime").isString(),
    body("endTime").isString(),
  ],
  bookingController.createBooking
);
router.put(
  "/:id",
  auth,
  [body("status").optional().isString(), body("notes").optional().isString()],
  bookingController.updateBooking
);
router.delete("/:id", auth, bookingController.deleteBooking);

module.exports = router;
