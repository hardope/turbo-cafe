"use client"

import { useState, useEffect } from "react"
import { Store, Plus, Edit, ToggleLeft, ToggleRight, Loader2, Upload, X } from "lucide-react"
import { createMenuItem, getMyMenuItems, updateMenuItem, activateMenuItem } from "@lib/menu"

export default function MenuManagement({ user }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL || "http://localhost:8080/"

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    wait_time_low: "",
    wait_time_high: "",
    description: "",
    image: null,
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await getMyMenuItems()
      // Transform API response to match component expectations
      const transformedItems =
        response.results?.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number.parseFloat(item.price),
          waitTime: `${item.wait_time_low}-${item.wait_time_high} mins`,
          wait_time_low: item.wait_time_low,
          wait_time_high: item.wait_time_high,
          image: `${mediaBaseUrl}${item.image}`,
          description: item.description || "No description available",
          available: item.available,
        })) || []
      setMenuItems(transformedItems)
    } catch (err) {
      setError(err.message)
      console.error("Failed to fetch menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewItem((prev) => ({ ...prev, image: file }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setNewItem({
      name: "",
      price: "",
      wait_time_low: "",
      wait_time_high: "",
      description: "",
      image: null,
    })
    setImagePreview(null)
    setEditingItem(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingItem) {
        await updateMenuItem(
          editingItem.id,
          newItem.name,
          newItem.description,
          Number.parseFloat(newItem.price),
          Number.parseInt(newItem.wait_time_low),
          Number.parseInt(newItem.wait_time_high),
          newItem.image,
        )
      } else {
        await createMenuItem(
          newItem.name,
          newItem.description,
          Number.parseFloat(newItem.price),
          Number.parseInt(newItem.wait_time_low),
          Number.parseInt(newItem.wait_time_high),
          newItem.image,
        )
      }

      resetForm()
      setShowAddForm(false)
      await fetchMenuItems() // Refresh the list
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      wait_time_low: item.wait_time_low.toString(),
      wait_time_high: item.wait_time_high.toString(),
      description: item.description,
      image: null,
    })
    setImagePreview(item.image)
    setShowAddForm(true)
  }

  const handleToggleAvailability = async (itemId) => {
    try {
      await activateMenuItem(itemId)
      await fetchMenuItems() // Refresh the list
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your food items and availability</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
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

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                resetForm()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price (₦)"
                value={newItem.price}
                onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Minimum Wait Time (minutes)"
                value={newItem.wait_time_low}
                onChange={(e) => setNewItem((prev) => ({ ...prev, wait_time_low: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Maximum Wait Time (minutes)"
                value={newItem.wait_time_high}
                onChange={(e) => setNewItem((prev) => ({ ...prev, wait_time_high: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Food Image</label>
              <div className="flex items-center space-x-4">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label
                  htmlFor="image-upload"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Image</span>
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{editingItem ? "Update Item" : "Add Item"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden border">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover"
              // onError={(e) => {
              //   e.target.src = "/placeholder.svg?height=200&width=300"
              // }}
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">₦{item.price}</span>
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    className={`p-1 rounded transition-colors ${
                      item.available ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {item.available ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2 text-sm">{item.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-orange-600">⏱️ {item.waitTime}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <button
                onClick={() => handleEdit(item)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Item</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No menu items yet</h3>
          <p className="text-gray-600 mb-4">Add your first item to get started!</p>
          <button
            onClick={() => {
              resetForm()
              setShowAddForm(true)
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  )
}
