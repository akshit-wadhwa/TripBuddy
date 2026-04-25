const express = require("express");
const { createRide, findRides, editRideStats, rideUsingId, bookRide, getUserBookedRides, cancelBooking } = require("../controllers/rideController");
const { protect } = require("../middlewares/protect");
const Ride = require("../models/Ride"); 
const router = express.Router();

router.post("/addRide", protect, createRide);
router.get("/search", findRides);
router.put("/:id", protect, editRideStats);
router.get("/:id", rideUsingId);

router.post("/:id/book", protect, bookRide);
router.delete("/:id/cancel", protect, cancelBooking);

router.get('/user/booked', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    console.log('🔍 Fetching booked rides for user:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const rides = await Ride.find({
      $or: [
        { 'driver.userId': userId },
        { 'passengers.userId': userId }
      ]
    })
    .populate('driver.userId', 'name phone email profilePicture rating')
    .populate('passengers.userId', 'name phone email profilePicture')
    .sort({ date: -1 });

    console.log('✅ Found rides:', rides.length);

    const ridesWithRole = rides.map(ride => {
      const rideObj = ride.toObject();
      
      const isDriver = ride.driver.userId._id.toString() === userId.toString();
      rideObj.userRole = isDriver ? 'driver' : 'passenger';
      
      const rideDate = new Date(ride.date);
      const currentDate = new Date();
      
      rideDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      if (rideDate < currentDate && ride.status === 'active') {
        rideObj.status = 'completed';
        Ride.findByIdAndUpdate(ride._id, { status: 'completed' }).exec();
      } else if (rideDate >= currentDate && ride.status !== 'cancelled') {
        rideObj.status = 'active';
      }
      
      if (!isDriver) {
        const passengerBooking = ride.passengers.find(p => 
          p.userId._id.toString() === userId.toString()
        );
        if (passengerBooking) {
          rideObj.bookingDate = passengerBooking.bookingDate;
          rideObj.seatsBooked = passengerBooking.seatsBooked;
          rideObj.paymentStatus = passengerBooking.paymentStatus;
        }
      }
      
      return rideObj;
    });

    res.json({
      success: true,
      rides: ridesWithRole,
      count: ridesWithRole.length
    });

  } catch (error) {
    console.error('❌ Error fetching user booked rides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booked rides',
      error: error.message
    });
  }
});
router.get("/user/booked/:status", protect, (req, res) => {
  req.query.status = req.params.status;
  getUserBookedRides(req, res);
});

router.get("/user/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const asDriver = await Ride.countDocuments({ 'driver.userId': userId });
    const asPassenger = await Ride.countDocuments({ 'passengers.userId': userId });
    const upcomingRides = await Ride.countDocuments({
      $or: [
        { 'driver.userId': userId },
        { 'passengers.userId': userId }
      ],
      date: { $gte: new Date() }
    });

    res.json({
      success: true,
      stats: {
        totalRidesAsDriver: asDriver,
        totalRidesAsPassenger: asPassenger,
        totalRides: asDriver + asPassenger,
        upcomingRides: upcomingRides
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
});

module.exports = router;