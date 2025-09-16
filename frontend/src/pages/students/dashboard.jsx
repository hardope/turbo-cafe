"use client"

import { useState } from "react"
import { User, Menu, X, ShoppingBag, Clock, Bell } from 'lucide-react'
import { mockMenuItems } from "../../utils/mock-data"
import BrowseMenu from "./browse-menu"
import CartPage from "./cart-page"
import OrdersPage from "./orders-page"
import { logout } from "@lib/api"


export default function StudentDashboard() {
  const [currentPage, setCurrentPage] = useState("browse")
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [menuItems] = useState(mockMenuItems)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem("USER")) || {}

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const placeOrder = () => {
    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      ticketNumber: Math.floor(Math.random() * 1000) + 1000,
      orderTime: new Date().toLocaleTimeString(),
      estimatedReady: new Date(Date.now() + 20 * 60000).toLocaleTimeString(),
    }
    setOrders((prev) => [...prev, newOrder])
    setCart([])
    setCurrentPage("orders")
  }

  const navigationItems = [
    { id: "browse", label: "Browse Menu", icon: ShoppingBag },
    { id: "orders", label: "My Orders", icon: Clock, badge: orders.filter(o => o.status === "pending").length },
  ]

  const pendingOrders = orders.filter(order => order.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">TurboCafe</h1>
              <p className="text-xs text-gray-500">Welcome, {user.first_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCurrentPage("cart")}
                className="relative p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              </button>
            )}
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
                    currentPage === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
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
              <img src="/image.png" alt="Logo" className="w-15 h-15 "  />
              <div>
                <h1 className="font-bold text-gray-800">TurboCafe</h1>
                <p className="text-sm text-gray-500">Student Portal</p>
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
                      ? "bg-blue-100 text-blue-700 shadow-sm"
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
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user.first_name} {user.last_name}</p>
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
            {currentPage === "browse" && (
              <BrowseMenu
                menuItems={menuItems}
                cart={cart}
                onAddToCart={addToCart}
                onGoToCart={() => setCurrentPage("cart")}
              />
            )}
            {currentPage === "cart" && (
              <CartPage
                cart={cart}
                onRemoveFromCart={removeFromCart}
                onPlaceOrder={placeOrder}
                onContinueShopping={() => setCurrentPage("browse")}
              />
            )}
            {currentPage === "orders" && <OrdersPage orders={orders} />}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <div className="p-4">
          {currentPage === "browse" && (
            <BrowseMenu
              menuItems={menuItems}
              cart={cart}
              onAddToCart={addToCart}
              onGoToCart={() => setCurrentPage("cart")}
            />
          )}
          {currentPage === "cart" && (
            <CartPage
              cart={cart}
              onRemoveFromCart={removeFromCart}
              onPlaceOrder={placeOrder}
              onContinueShopping={() => setCurrentPage("browse")}
            />
          )}
          {currentPage === "orders" && <OrdersPage orders={orders} />}
        </div>
      </div>
    </div>
  )
}
