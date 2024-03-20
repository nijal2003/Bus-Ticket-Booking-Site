const Booking = require("../models/bookingsModel");
const Bus = require("../models/busModel");
const User = require("../models/usersModel");
const stripe = require("stripe")(process.env.stripe_key);
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
require("dotenv").config();

// const Booking = require("../models/bookingsModel");
// const Bus = require("../models/busModel");
// const User = require("../models/usersModel");

const BookSeat = async (req, res) => {
  try {
    // Extract necessary data from request body
    const { busId, seats } = req.body;

    // Check if any of the selected seats are already booked for the given bus
    const existingBooking = await Booking.findOne({ bus: busId, seats: { $in: seats } });
    if (existingBooking) {
      return res.status(400).json({ message: "One or more selected seats are already booked" });
    }

    // Save the booking details in the database
    const newBooking = new Booking({
      bus: busId,
      seats,
      user: req.params.userId // Using req.params.userId from middleware
    });
    await newBooking.save();

    // Update the seatsBooked array of the bus model to mark the seats as booked
    const bus = await Bus.findById(busId);
    bus.seatsBooked = [...bus.seatsBooked, ...seats];
    await bus.save();

    // Return success response
    res.status(200).json({ message: "Seat(s) booked successfully", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
};

const GetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("bus").populate("user");
    res.status(200).send({
      message: "All bookings",
      data: bookings,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get bookings",
      data: error,
      success: false,
    });
  }
};

const GetAllBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate(["bus", "user"]);
    res.status(200).send({
      message: "Bookings fetched successfully",
      data: bookings,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Bookings fetch failed",
      data: error,
      success: false,
    });
  }
};

const CancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);
    const user = await User.findById(req.params.user_id);
    const bus = await Bus.findById(req.params.bus_id);
    if (!booking || !user || !bus) {
      return res.status(404).send({
        message: "Booking not found",
        success: false,
      });
    }

    // Remove booking document
    await booking.remove();

    // Remove seats from bus seatsBooked array
    bus.seatsBooked = bus.seatsBooked.filter(seat => !booking.seats.includes(seat));
    await bus.save();

    // Return success response
    res.status(200).send({
      message: "Booking cancelled successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Booking cancellation failed",
      data: error,
      success: false,
    });
  }
};

module.exports = {
  BookSeat,
  GetAllBookings,
  GetAllBookingsByUser,
  CancelBooking,
};



// // book seat and send email to user with the booking details
// const BookSeat = async (req, res) => {
//   try {
//     const { busId, seats } = req.body;

//     // Check if any of the selected seats are already booked for the given bus
//     const existingBooking = await Booking.findOne({ bus: busId, seats: { $in: seats } });
//     if (existingBooking) {
//       return res.status(400).json({ message: "One or more selected seats are already booked" });
//     }

//     // Save the booking details in the database
//     const newBooking = new Booking({
//       bus: busId,
//       seats,
//       user: req.user_id // Assuming you have user authentication and req.user contains the authenticated user's data
//     });
//     await newBooking.save();

//     // Update the seatsBooked array of the bus model to mark the seats as booked
//     const bus = await Bus.findById(busId);
//     bus.seatsBooked = [...bus.seatsBooked, ...seats];
//     await bus.save();

//     res.status(200).json({ message: "Seat(s) booked successfully", booking: newBooking });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Booking failed", error: error.message });
//   }
// };


// const GetAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find().populate("bus").populate("user");
//     res.status(200).send({
//       message: "All bookings",
//       data: bookings,
//       success: true,
//     });
//   } catch (error) {
//     console.log("e")
//     res.status(500).send({
//       message: "Failed to get bookings",
//       data: error,
//       success: false,
//     });
//   }
// };

// const GetAllBookingsByUser = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ user: req.params.user_Id }).populate([
//       "bus",
//       "user",
//     ]);
//     res.status(200).send({
//       message: "Bookings fetched successfully",
//       data: bookings,
//       success: true,
//     });
//   } catch (error) {
//     console.log("d")
//     res.status(500).send({
//       message: "Bookings fetch failed",
//       data: error,
//       success: false,
//     });
//   }
// };

// // cancel booking by id and remove the seats from the bus seatsBooked array
// const CancelBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.booking_id);
//     const user = await User.findById(req.params.user_id);
//     const bus = await Bus.findById(req.params.bus_id);
//     if (!booking || !user || !bus) {
//       res.status(404).send({
//         message: "Booking not found",
//         data: error,
//         success: false,
//       });
//     }

//     booking.remove();
//     bus.seatsBooked = bus.seatsBooked.filter(
//       (seat) => !booking.seats.includes(seat)
//     );
//     await bus.save();
//     res.status(200).send({
//       message: "Booking cancelled successfully",
//       data: booking,
//       success: true,
//     });
//   } catch (error) {
//     console.log("c")
//     res.status(500).send({
//       message: "Booking cancellation failed",
//       data: error,
//       success: false,
//     });
//   }
// };

// module.exports = {
//   BookSeat,
//   GetAllBookings,
//   GetAllBookingsByUser,
//   CancelBooking,
 
// };

