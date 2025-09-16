"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import Loader from "./loader"
import { api } from "@lib/api"
import {toast} from "sonner"

function AuthRoute({ children }) {
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Use useCallback to memoize these functions to prevent unnecessary re-renders
  const logoutUser = useCallback(() => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    localStorage.removeItem("USER")
    setIsAuthenticated(false)

    const currentRoute = window.location.pathname
    if (currentRoute !== "/auth") {
      localStorage.setItem("redirectPath", currentRoute)
    }

    navigate("/auth")
  }, [navigate])

  const refreshAccessToken = useCallback(async () => {
    setLoading(true)
    try {
      const refreshToken = localStorage.getItem("REFRESH_TOKEN")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await api.post("/auth/refresh", { refresh: refreshToken })

      localStorage.setItem("ACCESS_TOKEN", response.data.access)
      setLoading(false)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Token refresh failed", error)
      toast.error("Session expired. Please log in again.")
      setLoading(false)
      logoutUser()
      return false
    }
  }, [logoutUser])

  const checkAuth = useCallback(async () => {
    setLoading(true)
    const accessToken = localStorage.getItem("ACCESS_TOKEN")
    const refreshToken = localStorage.getItem("REFRESH_TOKEN")

    if (!accessToken || !refreshToken) {
      toast.info("You need to log in to access this page")
      setLoading(false)

      const currentRoute = window.location.pathname
      if (currentRoute !== "/auth") {
        localStorage.setItem("redirectPath", currentRoute)
      }

      navigate("/auth")
      return false
    }

    try {
      // Decode JWT to check expiry
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]))
      const expTime = tokenPayload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      const bufferTime = 60 * 1000 // 1 minute buffer

      if (currentTime >= expTime) {
        // Token expired, attempt refresh
        return await refreshAccessToken()
      } else if (expTime - currentTime <= bufferTime) {
        // Token about to expire, refresh it early
        return await refreshAccessToken()
      } else {
        // Token is still valid
        setLoading(false)
        setIsAuthenticated(true)
        return true
      }
    } catch (error) {
      console.error("Invalid token format", error)
      toast.error("Authentication error, please log in again.")
      setLoading(false)
      logoutUser()
      return false
    }
  }, [navigate, refreshAccessToken, logoutUser])

  // Run auth check on mount and set up interval
  useEffect(() => {
    let authCheckInterval

    const initialCheck = async () => {
      await checkAuth()

      // Set up interval to check auth status every minute
      authCheckInterval = setInterval(() => {
        checkAuth()
      }, 30000) // Check every 30 seconds
    }

    initialCheck()

    // Clean up interval on unmount
    return () => {
      if (authCheckInterval) clearInterval(authCheckInterval)
    }
  }, [checkAuth])

  // Add an interceptor to automatically handle 401 errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If we get a 401 error and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh the token
            const refreshed = await refreshAccessToken()
            if (refreshed) {
              // Update the authorization header
              const newToken = localStorage.getItem("ACCESS_TOKEN")
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return api(originalRequest)
            }
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      },
    )

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [refreshAccessToken])

  if (loading && !isAuthenticated) {
    return <Loader />
  }

  return children
}

export default AuthRoute