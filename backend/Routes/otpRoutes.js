const jwt = require("jsonwebtoken");
const express = require('express');
const  OTP = require('../models/otp');
const { sendMail } = require("../config/nodemailerconfig");

const User = require('../models/User');



const router = express.Router();

 
router.post("/send-otp" , async (req, res) => {
     const{email} = req.body;
     if(!email) return res.status(400).json({message : "Email is required"});


     try {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

          await OTP.create({
               email,
               otp,
               expiresAt
          })

          try {
               await sendMail(email, "Your TripBuddy Verification Code", otp);
               console.log("✅ OTP sent successfully via Nodemailer");
               res.status(200).json({
                    message: "OTP sent successfully",
                    provider: "Nodemailer"
               });
          } catch (emailError) {
               console.error("❌ Email sending failed:", emailError.message);
               res.status(200).json({
                    message: "OTP generated and saved. Email delivery may be delayed due to service issues.",
                    warning: "Please check your email in a few minutes or request a new OTP if needed.",
                    emailError: true
               });
          }
     }

     catch (error) {
          console.error("Error generating or sending OTP:", error);
          res.status(500).json({message : "Internal server error"});
     }
});

router.post("/verify-otp", async (req, res) => {
     const {email, otp} = req.body;
     if(!email || !otp) return res.status(400).json({message : "Email and OTP are required"});      
     try {
          const record = await OTP.findOne({email , otp}); 
          if(!record) return res.status(400).json({message : "Invalid OTP"});
          if(record.expiresAt < new Date()) {
               return res.status(400).json({message : "OTP has expired"});
          }
          await OTP.deleteOne({email, otp});

          const user = await User.findOne({email});
          if(!user) return res.status(400).json({message : "User not found"});

          const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : "1h"});

          res.status(200).json({message : "OTP verified successfully" , token});
     }
     catch (error) {
          console.error("Error verifying OTP:", error);
          res.status(500).json({message : "Internal server error"});
     }
});

router.post("/test-email", async (req, res) => {
     try {
          const { email } = req.body;
          
          if (!email) {
               return res.status(400).json({ 
                    success: false, 
                    message: 'Email is required' 
               });
          }

          console.log('🧪 Testing email delivery to:', email);
          console.log('🔧 Using Email:', process.env.EMAIL ? 'Present' : 'Missing');
          console.log('🔧 Using App Password:', process.env.EMAIL_PASSWORD ? 'Present' : 'Missing');
          
          const testOTP = Math.floor(100000 + Math.random() * 900000);
          
          await sendMail(email, "🧪 Test Email - TripBuddy OTP Service", testOTP);
          
          console.log('✅ Test email sent successfully via Nodemailer');
          
          res.status(200).json({
               success: true,
               message: 'Test email sent successfully!',
               provider: 'Nodemailer',
               testOTP: testOTP,
               emailService: 'Nodemailer configured'
          });

     } catch (error) {
          console.error('❌ Test email failed:', error);
          res.status(500).json({
               success: false,
               message: 'Test email failed',
               error: error.message,
               emailService: 'Nodemailer - Error occurred'
          });
     }
});

router.get("/email-status", (req, res) => {
     const emailConfigured = !!(process.env.EMAIL && process.env.EMAIL_PASSWORD);
     res.status(200).json({
          status: emailConfigured,
          message: emailConfigured ? "Nodemailer service available" : "Email service not configured",
          service: "Nodemailer with Gmail SMTP",
          configured: emailConfigured ? "Available" : "Not configured"
     });
});

module.exports = router;