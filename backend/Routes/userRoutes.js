const express = require("express");
const { protect } = require("../middlewares/protect");
const { 
  getMyRides, 
  getProfile, 
  updateProfile, 
  updateRideStatus,
  deleteRide,
  getDashboardStats,
  getUserRidesNew,
  getBookedRides,
  // Profile completion
  getProfileCompletion,
  // Vehicle management
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  // Emergency contacts
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  // Settings
  updateNotificationSettings,
  updatePrivacySettings,
  changePassword,
  // Account verification
  verifyAccount,
  // Enhanced profile update
  updateProfileComplete
} = require("../controllers/userController");

const router = express.Router();


router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/profile-completion", protect, getProfileCompletion);

router.get("/vehicles", protect, getVehicles);
router.post("/vehicles", protect, addVehicle);
router.put("/vehicles/:vehicleId", protect, updateVehicle);
router.delete("/vehicles/:vehicleId", protect, deleteVehicle);

router.get("/emergency-contacts", protect, getEmergencyContacts);
router.post("/emergency-contacts", protect, addEmergencyContact);
router.put("/emergency-contacts/:contactId", protect, updateEmergencyContact);
router.delete("/emergency-contacts/:contactId", protect, deleteEmergencyContact);

router.put("/notification-settings", protect, updateNotificationSettings);
router.put("/privacy-settings", protect, updatePrivacySettings);
router.put("/change-password", protect, changePassword);

router.post("/verify-account", protect, verifyAccount);

router.put("/profile-complete", protect, updateProfileComplete);

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/user-rides', protect, getUserRidesNew);
router.get('/booked-rides', protect, getBookedRides);

router.get("/my-rides", protect, getMyRides); 

router.put("/rides/:rideId/status", protect, updateRideStatus);
router.delete("/rides/:rideId", protect, deleteRide);

module.exports = router;