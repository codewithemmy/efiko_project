const mongoose = require("mongoose")
const { AdminRepository } = require("./admin.repository")
const {
  verifyPassword,
  tokenHandler,
  queryConstructor,
  AlphaNumeric,
  hashPassword,
} = require("../../utils/index")
const { authMessages } = require("./messages/auth.messages")
const { adminMessages } = require("./messages/admin.messages")

const {
  NotificationRepository,
} = require("../notification/notification.repository")
const { sendMailNotification } = require("../../utils/email")
const { CurriculumRepository } = require("../curriculum/curriculum.repository")

class AdminAuthService {
  static async adminSignUpService(data, locals) {
    const { accountType, fullName, email } = data

    if (locals.accountType != "superAdmin") {
      return { success: false, msg: authMessages.SUPER_ADMIN }
    }
    const admin = await AdminRepository.fetchAdmin({
      email: data.email,
    })

    if (admin) {
      return { success: false, msg: authMessages.ADMIN_EXISTS }
    }

    const generatePassword = await AlphaNumeric(8)

    const password = await hashPassword(generatePassword)
    const signUp = await AdminRepository.create({
      ...data,
      password,
    })

    if (accountType === "normalAdmin") {
      const substitutional_parameters = {
        name: fullName,
        password: generatePassword,
        email,
      }

      await sendMailNotification(
        email,
        "Sign-Up",
        substitutional_parameters,
        "ADMIN_WELCOME"
      )
      await NotificationRepository.createNotification({
        recipientId: new mongoose.Types.ObjectId(signUp._id),
        title: `New Admin`,
        message: `Welcome to Efiko Learning, we are glad to have you with us`,
      })
    }

    return { success: true, msg: authMessages.ADMIN_CREATED, data: signUp }
  }

  static async adminLoginService(body) {
    const { email, password } = body
    const admin = await AdminRepository.fetchAdmin({
      email: email,
    })

    if (!admin) {
      return {
        success: false,
        msg: authMessages.LOGIN_ERROR,
      }
    }

    const passwordCheck = await verifyPassword(password, admin.password)

    if (!passwordCheck) {
      return { success: false, msg: authMessages.INCORRECT_PASSWORD }
    }

    admin.password = undefined

    const token = await tokenHandler({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      status: admin.status,
      accountType: admin.accountType,
      userType: admin.userType,
      isAdmin: true,
    })

    const adminDetails = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      accountType: admin.accountType,
      status: admin.status,
      userType: admin.userType,
      ...token,
    }
    return {
      success: true,
      msg: authMessages.ADMIN_FOUND,
      data: adminDetails,
    }
  }

  static async getAdminService(userPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "Admin"
    )
    if (error) return { success: false, msg: error }

    const total = await CurriculumRepository.findAdminParams({ ...params })

    const getAdmin = await CurriculumRepository.findAdminParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (getAdmin.length < 1)
      return { success: false, msg: authMessages.ADMIN_NOT_FOUND }

    getAdmin.password = undefined
    return {
      success: true,
      msg: authMessages.ADMIN_FOUND,
      data: getAdmin,
      length: getAdmin.length,
      total: total.length,
    }
  }

  static async updateAdminService(data, params) {
    const { status } = data
    let admin
    if ((status && status === "Active") || (status && status === "Inactive")) {
      admin = await AdminRepository.updateAdminById(params.id, {
        ...data,
      })
    } else if (
      (status && status !== "Active") ||
      (status && status !== "Inactive")
    ) {
      {
        return { success: false, msg: `status is either Active or Inactive` }
      }
    }

    if (!status) {
      admin = await AdminRepository.updateAdminById(params.id, {
        ...data,
      })
    }

    if (!admin)
      return {
        success: false,
        msg: adminMessages.UPDATE_PROFILE_FAILURE,
      }

    admin.password = ""

    return {
      success: true,
      msg: adminMessages.UPDATE_PROFILE_SUCCESS,
      admin,
    }
  }

  static async changePassword(body) {
    const { prevPassword } = body

    const admin = await AdminRepository.fetchAdmin({
      _id: new mongoose.Types.ObjectId(body.id),
    })

    if (!admin) return { success: false, msg: authMessages.ADMIN_NOT_FOUND }

    //verify password
    const prevPasswordCheck = await verifyPassword(prevPassword, admin.password)

    if (!prevPasswordCheck)
      return { success: false, msg: authMessages.INCORRECT_PASSWORD }

    //change password
    if (body.password !== body.confirmPassword) {
      return {
        success: false,
        msg: authMessages.MISMATCH_PASSWORD,
      }
    }

    let password = await hashPassword(body.password)

    const changePassword = await AdminRepository.updateAdminDetails(
      { _id: new mongoose.Types.ObjectId(body.id) },
      {
        password,
      }
    )

    if (changePassword) {
      return {
        success: true,
        msg: authMessages.PASSWORD_RESET_SUCCESS,
      }
    } else {
      return {
        success: false,
        msg: authMessages.PASSWORD_RESET_FAILURE,
      }
    }
  }

  static async uploadImageService(data, payload) {
    const { image } = data
    const user = await this.updateAdminService({
      params: { id: mongoose.Types.ObjectId(payload._id) },
      body: { image },
    })
    if (!user) {
      return {
        success: false,
        msg: adminMessages.UPDATE_IMAGE_FAILURE,
      }
    } else {
      return {
        success: true,
        msg: adminMessages.UPDATE_IMAGE_SUCCESS,
        user,
      }
    }
  }

  static async getLoggedInAdminService(adminPayload) {
    const { _id } = adminPayload
    const getAdmin = await AdminRepository.fetchAdmin({
      _id: new mongoose.Types.ObjectId(_id),
    })

    if (!getAdmin) return { success: false, msg: authMessages.ADMIN_NOT_FOUND }

    return { success: true, msg: authMessages.ADMIN_FOUND, data: getAdmin }
  }

  static async resetAdminPassword(params) {
    const getAdmin = await AdminRepository.fetchAdmin({
      _id: new mongoose.Types.ObjectId(params),
    })

    if (!getAdmin) return { success: false, msg: authMessages.ADMIN_NOT_FOUND }

    let password = AlphaNumeric(8, "number")

    const hashedPassword = await hashPassword(password)

    const updateAdminPassword = await AdminRepository.updateAdminDetails(
      {
        _id: new mongoose.Types.ObjectId(params),
      },
      { password: hashedPassword }
    )

    if (!updateAdminPassword)
      return { success: false, msg: `Unable to update admin password` }

    try {
      const substitutional_parameters = {
        name: getAdmin?.fullName,
        password: password,
      }

      await sendMailNotification(
        getAdmin.email,
        "Password Reset",
        substitutional_parameters,
        "PASSWORD_RESET"
      )
    } catch (error) {
      console.log("error", error)
    }

    return { success: true, msg: authMessages.PASSWORD_RESET_SUCCESS }
  }
}

module.exports = { AdminAuthService }
