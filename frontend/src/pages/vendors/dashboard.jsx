"use client"

import { useState, useEffect } from "react"
import { Store, Menu, X, Package, ClipboardList, Bell } from "lucide-react"
import { mockOrders } from "../../utils/mock-data"
import MenuManagement from "./menu-management"
import OrderManagement from "./order-management"
import { logout } from "@lib/api"
import { getOrderStats } from "@lib/order"

export default function VendorDashboard() {
  const [currentPage, setCurrentPage] = useState("menu")
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState(mockOrders)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    ready_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: "0.00",
    avg_order_value: "0.00"
  })
  const user = JSON.parse(localStorage.getItem("USER"))

  const addMenuItem = (item) => {
    setMenuItems((prev) => [...prev, { ...item, id: Date.now() }])
  }

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const getVendorOrderStats = async () => {
    try {
        const stats = await getOrderStats()
        setOrderStats(stats)
        return stats
    } catch (error) {
        console.error("Error fetching order stats:", error)
        return { totalOrders: 0, totalRevenue: 0 }
    }
}   

    useEffect(() => {
        getVendorOrderStats()
    }, [])
        

  const pendingOrders = orderStats.pending_orders || 0
  const totalRevenue = orderStats.total_revenue || "0.00"

  const navigationItems = [
    { id: "menu", label: "Menu Management", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList, badge: pendingOrders },
  ]

  const StatCard = ({ title, value, subtitle, color = "green" }) => (
    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold text- ₦{color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
              <img src="/image.png" alt="Logo" className="w-15 h-15" />
            <div>
              <h1 className="font-semibold text-gray-800">{user.vendor_name}</h1>

              <p className="text-xs text-gray-500">Vendor Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {pendingOrders > 0 && (
              <button className="relative p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingOrders}
                </span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors  ₦{
                    currentPage === item.id ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{item.badge}</span>
                  )}
                </button>
              ))}
              <div className="border-t pt-2 mt-2">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{user.vendor_name}</h1>
                <p className="text-sm text-gray-500">Vendor Portal</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200  ₦{
                    currentPage === item.id
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Stats in Sidebar */}
            <div className="mt-6 space-y-3">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-green-700"> ₦{orderStats.total_revenue}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 mb-1">Pending Orders</p>
                <p className="text-xl font-bold text-orange-700">{orderStats.pending_orders}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {user.first_name?.charAt(0)}
                  {user.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Dashboard Overview */}
            
            {currentPage === "menu" && <MenuManagement menuItems={menuItems} onAddMenuItem={addMenuItem} user={user} />}
            {currentPage === "orders" && <OrderManagement orders={orders} onUpdateOrderStatus={updateOrderStatus} />}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <div className="p-4">
          {/* Mobile Stats */}
          {currentPage === "analytics" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
                <p className="text-gray-600 text-sm">Business overview</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard title="Revenue" value={todayRevenue.toFixed(2)} subtitle="today" />
                <StatCard title="Orders" value={pendingOrders} color="orange" />
              </div>
            </div>
          )}

          {currentPage === "menu" && <MenuManagement menuItems={menuItems} onAddMenuItem={addMenuItem} user={user} />}
          {currentPage === "orders" && <OrderManagement orders={orders} onUpdateOrderStatus={updateOrderStatus} />}
        </div>
      </div>
    </div>
  )
}
