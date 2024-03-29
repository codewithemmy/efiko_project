const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const {
  SubscriptionOrderSuccess,
  SubscriptionOrderFailure,
} = require("./subscriptionOrder.messages")
const {
  SubscriptionOrderRepository,
} = require("./subscriptionOrder.repository")

class SubscriptionOrderService {
  static async createSubscriptionOrder(payload) {
    const subscriptionOrder = await SubscriptionOrderRepository.create({
      ...payload,
    })

    if (!subscriptionOrder._id)
      return { success: false, msg: SubscriptionOrderFailure.CREATE }

    return {
      success: true,
      msg: SubscriptionOrderSuccess.CREATE,
    }
  }

  static async getSubscriptionOrderService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "SubscriptionOrder"
    )
    if (error) return { success: false, msg: error }

    const total =
      await SubscriptionOrderRepository.findSubscriptionOrderWithParams({})

    const subscriptionOrder =
      await SubscriptionOrderRepository.findAllSubscriptionOrderParams({
        ...params,
        limit,
        skip,
        sort,
      })

    if (subscriptionOrder.length < 1)
      return {
        success: true,
        msg: SubscriptionOrderFailure.NOT_FOUND,
        data: [],
      }

    return {
      success: true,
      msg: SubscriptionOrderSuccess.FETCH,
      data: subscriptionOrder,
      length: subscriptionOrder.length,
      total: total.length,
    }
  }

  static async updateSubscriptionOrderService(data, params) {
    const subscriptionOrder =
      await SubscriptionOrderRepository.updateSubscriptionOrderDetails(
        { _id: new mongoose.Types.ObjectId(params.id) },
        {
          ...data,
        }
      )

    if (!subscriptionOrder)
      return {
        success: false,
        msg: SubscriptionOrderFailure.CREATE,
      }

    return {
      success: true,
      msg: SubscriptionOrderSuccess.UPDATE,
    }
  }

  static async deleteSubscriptionOrderService(params) {
    const subscriptionOrder =
      await SubscriptionOrderRepository.deleteSubscriptionOrderDetails({
        _id: new mongoose.Types.ObjectId(params.id),
      })

    if (!subscriptionOrder)
      return {
        success: false,
        msg: SubscriptionOrderFailure.DELETE,
      }

    return {
      success: true,
      msg: SubscriptionOrderSuccess.DELETE,
    }
  }
}

module.exports = { SubscriptionOrderService }
