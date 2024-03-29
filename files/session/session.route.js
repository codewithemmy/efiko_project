const { checkSchema } = require("express-validator")
const sessionRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { validate } = require("../../validations/validate")
const {
  sessionValidation,
} = require("../../validations/session/session.validation")
const {
  createSessionController,
  updateSessionController,
  getSessionController,
  rateSessionController,
  getReviewServiceController,
  getZoomSessionController,
  zoomWebhookController,
  deleteSessionController,
  assignStudentController,
} = require("./session.controller")

sessionRoute.route("/zoom/webhook").post(zoomWebhookController)

sessionRoute.use(isAuthenticated)

//routes
sessionRoute.route("/").post(createSessionController)

sessionRoute.route("/:id").patch(updateSessionController)
sessionRoute.route("/assign/:id").patch(assignStudentController)

sessionRoute.route("/").get(getSessionController)
sessionRoute.route("/:id").delete(deleteSessionController)
sessionRoute.route("/rating/:id").patch(rateSessionController)
sessionRoute.route("/rating/:id").get(getReviewServiceController)
sessionRoute.route("/zoom").get(getZoomSessionController)

module.exports = sessionRoute
