"use client"

import { useState, useEffect } from "react"
import { Clock, Package, CheckCircle, XCircle, Phone, Loader2, RefreshCw } from "lucide-react"
import { getStudentOrders, cancelOrder } from "@lib/order"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || "http://localhost:8080/"

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getStudentOrders()

      console.log("Fetched Orders:", response)

      // Transform API response to match component expectations
      const transformedOrders = Array.isArray(response.results)
        ? response.results.map((order) => ({
            id: order.id,
            ticketNumber: order.id, // Using order ID as ticket number
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
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrder(orderId)
      await cancelOrder(orderId)
      await fetchOrders() // Refresh orders after cancellation
    } catch (err) {
      setError(err.message)
    } finally {
      setCancellingOrder(null)
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
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
          <p className="text-gray-600 mt-1">Track your food orders and pickup status</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-600">Start browsing the menu to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={order.menuItemImage || "/placeholder.svg"}
                      alt={order.items[0]?.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=64&width=64"
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Order #{order.ticketNumber}</h3>
                      <p className="text-gray-600">Placed at {order.orderTime}</p>
                      <p className="text-sm text-gray-500">From {order.vendorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </span>

                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {cancellingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
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
                    <span className="text-xl font-bold text-blue-600">₦{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {order.status === "ready" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Your order is ready for pickup!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Show this ticket number at the vendor counter: <strong>#{order.ticketNumber}</strong>
                    </p>
                  </div>
                )}

                {order.status === "pending" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Estimated ready time:</strong> {order.estimatedReady}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll be notified when your order is ready for pickup.
                    </p>
                  </div>
                )}

                {order.vendorPhone && order.status !== "cancelled" && order.status !== "completed" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Need help with your order?</span>
                      <a
                        href={`tel:${order.vendorPhone}`}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call Vendor</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
