const mongoose = require("mongoose")
const { Admin } = require("../admin/admin.model")

class AdminRepository {
  static async create(body) {
    return Admin.create(body)
  }

  static async fetchAdmin(body) {
    const admin = await Admin.findOne({ ...body })
    return admin
  }
  static async fetchAdminParams(body) {
    const admin = await Admin.find({ ...body })
    return admin
  }

  static async updateAdminDetails(query, params) {
    return Admin.findOneAndUpdate({ ...query }, { $set: { ...params } })
  }

  static async findAdminParams(userPayload) {
    const { limit, skip, sort, search, ...restOfPayload } = userPayload

    let query = {}

    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        ...restOfPayload,
      }
    }

    if (search === null || search === undefined) {
      query = {
        ...restOfPayload,
      }
    }

    const admin = await Admin.find(
      {
        ...query, // Spread the query object to include its properties
      },
      { password: 0 }
    )
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return admin
  }

  static async updateAdminById(id, params) {
    return Admin.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { ...params } },
      { new: true, runValidators: true }
    )
  }
}

module.exports = { AdminRepository }
