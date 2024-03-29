const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  verifyUserController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  loginCodeController,
} = require("./controller/auth.controller")
const { userStatusVerifier } = require("../../utils")

const authRoute = require("express").Router()

//routes
authRoute.post("/verify", verifyUserController)
authRoute.post("/forgot-password", forgotPasswordController)
authRoute.patch("/reset-password", resetPasswordController)
authRoute.post("/verify-otp", verifyOtpController)
authRoute.post("/login-code", userStatusVerifier, loginCodeController)

module.exports = authRoute
