const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ clientId: req.user.id });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ownership Check: Ensure user is the client or caregiver for this booking
    if (
      booking.clientId.toString() !== req.user.id &&
      booking.caregiverId.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to view this booking.",
        });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const booking = new Booking({ ...req.body, clientId: req.user.id });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ownership Check: Ensure user is the client or caregiver for this booking
    if (
      booking.clientId.toString() !== req.user.id &&
      booking.caregiverId.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to update this booking.",
        });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Ownership Check: Ensure only the client who created the booking can delete it
    if (booking.clientId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to delete this booking.",
        });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
};
