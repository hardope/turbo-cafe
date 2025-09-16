"use client"

import { useState, useEffect } from "react"
import { Clock, Phone, CheckCircle, Package, User, Loader2, RefreshCw } from "lucide-react"
import { getVendorOrders, updateOrderStatus } from "@lib/order"

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [filter, setFilter] = useState("all")
  const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || "http://localhost:8080/"

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getVendorOrders()

    // Transform API response to match component expectations
    const transformedOrders = Array.isArray(response.results)
        ? response.results.map((order) => ({
                id: order.id,
                ticketNumber: order.id, // Using order ID as ticket number
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                customerMatric: order.customer_matric,
                items: [
                    {
                        id: order.id,
                        name: order.menu_item_name,
                        quantity: order.quantity,
                        price: Number.parseFloat(order.menu_item_price || 0),
                    },
                ],
                total: Number.parseFloat(order.total_price),
                status: order.status,
                orderTime: new Date(order.created_at).toLocaleTimeString(),
                estimatedReady: new Date(new Date(order.created_at).getTime() + 20 * 60000).toLocaleTimeString(),
                vendorName: order.vendor_name,
                vendorPhone: order.vendor_phone,
                menuItemImage: order.menu_item_image
                    ? `${mediaBaseUrl}${order.menu_item_image}`
                    : "/placeholder.svg?height=200&width=300",
                createdAt: order.created_at,
                updatedAt: order.updated_at,
            }))
        : [];
    console.log("Transformed Orders:", transformedOrders);

    // Sort by creation date (newest first)
    transformedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setOrders(transformedOrders)
    } catch (err) {
      setError(err.message)
      console.error("Failed to fetch vendor orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId)
      await updateOrderStatus(orderId, newStatus)
      await fetchOrders() // Refresh orders after status update
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "preparing":
        return <Package className="w-4 h-4" />
      case "ready":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const preparingOrders = orders.filter((order) => order.status === "preparing").length
  const readyOrders = orders.filter((order) => order.status === "ready").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Preparing</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{preparingOrders}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Ready</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{readyOrders}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-1">{orders.length}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "Orders will appear here when customers place them"
              : `No orders with ${filter} status at the moment`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Order #{order.ticketNumber}</h3>
                    <p className="text-gray-600">Customer: {order.customerName}</p>
                    <p className="text-gray-600">Email: {order.customerEmail}</p>
                    <p className="text-gray-600">Matric: {order.customerMatric}</p>
                    <p className="text-gray-600">Order Time: {order.orderTime}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-green-600">₦{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {order.status === "pending" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                    disabled={updatingOrder === order.id}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {updatingOrder === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </>
                    )}
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                    disabled={updatingOrder === order.id}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {updatingOrder === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Ready</span>
                      </>
                    )}
                  </button>
                )}

                {order.status === "ready" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                    disabled={updatingOrder === order.id}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {updatingOrder === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                )}

                {order.customerPhone && order.status !== "cancelled" && order.status !== "completed" && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex-1 sm:flex-none bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Customer</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
