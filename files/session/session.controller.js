const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { SessionService } = require("./session.service")

const createSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.createSession(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.updateSessionService(
      req.params.id,
      req.body,
      res.locals.jwt._id
    )
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getSessionService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const rateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.rateSessionService(req.params.id, req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getReviewServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getReviewService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getZoomSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(SessionService.getZoomSession())

  console.log("error", error)

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const zoomWebhookController = async (req, res, next) => {
  console.log("req", req.body)
  const [error, data] = await manageAsyncOps(
    SessionService.zoomSessionWebhookService(req.body)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  res.status(200).end()
}

module.exports = {
  createSessionController,
  updateSessionController,
  getSessionController,
  rateSessionController,
  getReviewServiceController,
  getZoomSessionController,
  zoomWebhookController,
}
