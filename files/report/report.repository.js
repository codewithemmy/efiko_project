const { Report } = require("./report.model")
const mongoose = require("mongoose")
const { pagination } = require("../../utils")

class ReportRepository {
  static async create(reportPayload) {
    return await Report.create(reportPayload)
  }

  static async findSingleReportWithParams(reportPayload, select) {
    const report = await Report.findOne({ ...reportPayload }).select(select)

    return report
  }
  static async findReportWithParams(reportPayload, select) {
    const report = await Report.find({ ...reportPayload }).select(select)

    return report
  }

  static async findAllReportParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
        ...restOfPayload,
      }
    }

    if (search === "" || search === undefined) {
      query = {
        ...restOfPayload,
      }
    }
    const { currentSkip, currentLimit } = pagination(skip, limit)
    const report = await Report.find({ ...query })
      .populate({
        path: "reportedBy",
        select: "firstName lastName fullName email",
      })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return report
  }

  static async updateReportDetails(id, params) {
    return Report.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { ReportRepository }
