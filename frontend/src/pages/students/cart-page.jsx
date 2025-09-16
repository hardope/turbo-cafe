"use client"

import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { createOrder } from "@lib/order"

export default function CartPage({ cart, onRemoveFromCart, onContinueShopping, onOrderPlaced }) {
  const [quantities, setQuantities] = useState({})
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState(null)

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(itemId)
    } else {
      setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }))
    }
  }

  const getItemQuantity = (itemId) => quantities[itemId] || 1

  const totalAmount = cart.reduce((sum, item) => sum + item.price * getItemQuantity(item.id), 0)

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      setError(null)

      // Create orders for each item in cart
      const orderPromises = cart.map((item) => createOrder(item.id, getItemQuantity(item.id)))

      await Promise.all(orderPromises)

      // Clear cart and redirect to orders page
      cart.forEach((item) => onRemoveFromCart(item.id))
      if (onOrderPlaced) {
        onOrderPlaced()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={onContinueShopping} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Your Cart</h1>
          <p className="text-gray-600 mt-1">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="hidden lg:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm mt-2">
            Dismiss
          </button>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
          <button
            onClick={onContinueShopping}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={`${item.image}`}
                    alt={item.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-xl"
                    
                  />

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.vendor}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="font-medium text-gray-800 min-w-[2rem] text-center">
                          {getItemQuantity(item.id)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          ₦{(item.price * getItemQuantity(item.id)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">₦{item.price} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{totalAmount.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₦{(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Estimated wait time:</strong> 15-25 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
