"use client"

import { getMenuItems } from "@lib/menu"
import { ShoppingBag, Search, Star, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function BrowseMenu({ cart, onAddToCart, onGoToCart }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || "http://localhost:8080/"

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await getMenuItems()
      // Transform API response to match component expectations
      console.log("Fetched Menu Items:", response.results)
      const transformedItems =
        response.results?.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number.parseFloat(item.price),
          waitTime: `${item.wait_time_low}-${item.wait_time_high} mins`,
          image: `${mediaBaseUrl}${item.image}`,
          description: item.description || "Delicious food item",
          vendor: item.vendor_name,
          available: item.available,
        })) || []
      setMenuItems(transformedItems.filter((item) => item.available))
    } catch (err) {
      setError(err.message)
      console.error("Failed to fetch menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading delicious food...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Menu</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Browse Menu</h1>
          <p className="text-gray-600 mt-1">Discover delicious food from campus vendors</p>
        </div>

        {/* Cart Button - Desktop */}
        <div className="hidden sm:block">
          <button
            onClick={onGoToCart}
            className="relative bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">View Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 lg:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </p>
        <button onClick={fetchMenuItems} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Refresh
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
          >
            <div className="relative overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-48 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">4.5</span>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <span className="text-xl font-bold text-blue-600">₦{item.price}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">by {item.vendor}</span>
                <span className="text-sm text-orange-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                  {item.waitTime}
                </span>
              </div>

              <button
                onClick={() => onAddToCart(item)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Mobile Cart Button */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={onGoToCart}
          className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
