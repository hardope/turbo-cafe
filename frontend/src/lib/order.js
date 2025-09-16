import { api } from "./api"

// Create new order (students only)
const createOrder = async (menu_item, quantity) => {
  try {
    const response = await api.post("/orders/create/", {
      menu_item,
      quantity,
    })
    return response.data
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error(error.response?.data?.message || "Failed to create order")
  }
}

// Get all orders (admin) or user's own orders
const getAllOrders = async () => {
  try {
    const response = await api.get("/orders/")
    return response.data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch orders")
  }
}

// Get specific order details
const getOrderDetails = async (id) => {
  try {
    const response = await api.get(`/orders/${id}/`)
    return response.data
  } catch (error) {
    console.error("Error fetching order details:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch order details")
  }
}

// Cancel order (order owners only)
const cancelOrder = async (id) => {
  try {
    const response = await api.patch(`/orders/${id}/cancel/`, {
      status: "cancelled"
    })
    return response.data
  } catch (error) {
    console.error("Error cancelling order:", error)
    throw new Error(error.response?.data?.message || "Failed to cancel order")
  }
}

// Update order status (vendors only)
const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}/update-status/`, {
      status,
    })
    return response.data
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error(error.response?.data?.message || "Failed to update order status")
  }
}

// Get recent orders
const getRecentOrders = async () => {
  try {
    const response = await api.get("/orders/recent/")
    return response.data
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch recent orders")
  }
}

// Search orders
const searchOrders = async (searchParams = {}) => {
  try {
    const response = await api.get("/orders/search/", { params: searchParams })
    return response.data
  } catch (error) {
    console.error("Error searching orders:", error)
    throw new Error(error.response?.data?.message || "Failed to search orders")
  }
}

// Get order statistics
const getOrderStats = async () => {
  try {
    const response = await api.get("/orders/stats/")
    return response.data
  } catch (error) {
    console.error("Error fetching order statistics:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch order statistics")
  }
}

// Get student's orders
const getStudentOrders = async () => {
  try {
    const response = await api.get("/orders/student/my-orders/")
    return response.data
  } catch (error) {
    console.error("Error fetching student orders:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch student orders")
  }
}

// Get vendor's orders
const getVendorOrders = async () => {
  try {
    const response = await api.get("/orders/vendor/my-orders/")
    return response.data
  } catch (error) {
    console.error("Error fetching vendor orders:", error)
    throw new Error(error.response?.data?.message || "Failed to fetch vendor orders")
  }
}

export {
  createOrder,
  getAllOrders,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  getRecentOrders,
  searchOrders,
  getOrderStats,
  getStudentOrders,
  getVendorOrders,
}
