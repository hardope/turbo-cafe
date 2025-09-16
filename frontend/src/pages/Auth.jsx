"use client"

import { useState } from "react"
import { User, ShoppingBag, Store, LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { login, signup } from "@lib/auth"
import { useNavigate } from "react-router-dom"

const ACCENT_COLOR = "#00796a"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [userType, setUserType] = useState("student")
    const [formData, setFormData] = useState({})
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")

        if (isLogin) {
            const success = login(formData.email, formData.password, navigate)
            if (!success) {
                setError("Invalid credentials")
            }
        } else {
            const userData = { ...formData, role: userType }
            const success = signup(userData)
            if (!success) {
                setError("Signup failed. Please try again.")
            }
        }
    }

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const onBack = () => {
        navigate(-1)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1 text-center">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src={"/image.png"} alt="Logo" className="w-12 h-12 rounded-full" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">TurboCafe</h1>
                        <p className="text-gray-600">Your campus food ordering platform</p>
                    </div>
                </div>

                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            isLogin ? "bg-white text-gray-800 shadow-sm" : "text-gray-600"
                        }`}
                        style={isLogin ? { color: ACCENT_COLOR, borderColor: ACCENT_COLOR } : {}}
                    >
                        <LogIn className="w-4 h-4 inline mr-2" />
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            !isLogin ? "bg-white text-gray-800 shadow-sm" : "text-gray-600"
                        }`}
                        style={!isLogin ? { color: ACCENT_COLOR, borderColor: ACCENT_COLOR } : {}}
                    >
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Sign Up
                    </button>
                </div>

                {!isLogin && (
                    <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setUserType("student")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                userType === "student" ? "bg-[#00796a] text-white" : "text-gray-600"
                            }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Student
                        </button>
                        <button
                            onClick={() => setUserType("vendor")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                userType === "vendor" ? "bg-[#00796a] text-white" : "text-gray-600"
                            }`}
                        >
                            <Store className="w-4 h-4 inline mr-2" />
                            Vendor
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && userType === "vendor" && (
                        <input
                            type="text"
                            name="vendor_name"
                            placeholder="Vendor Name"
                            required
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ focusRingColor: ACCENT_COLOR }}
                        />
                    )}

                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                required
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                                style={{ focusRingColor: ACCENT_COLOR }}
                            />
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                required
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                                style={{ focusRingColor: ACCENT_COLOR }}
                            />
                        </>
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                        style={{ focusRingColor: ACCENT_COLOR }}
                    />

                    {!isLogin && (
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            required
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ focusRingColor: ACCENT_COLOR }}
                        />
                    )}

                    {/* Password input with eye icon */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            required
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ focusRingColor: ACCENT_COLOR }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {!isLogin && userType === "student" && (
                        <input
                            type="text"
                            name="matric_number"
                            placeholder="Matric Number"
                            required
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                            style={{ focusRingColor: ACCENT_COLOR }}
                        />
                    )}

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors"
                        style={{
                            backgroundColor: ACCENT_COLOR,
                            borderColor: ACCENT_COLOR,
                        }}
                    >
                        {isLogin ? "Login" : `Sign Up as ${userType === "vendor" ? "Vendor" : "Student"}`}
                    </button>
                </form>
            </div>
        </div>
    )
}
