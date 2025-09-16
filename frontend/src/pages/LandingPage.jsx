"use client"

import { ShoppingBag, Users, Clock, Star, ArrowRight, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

const ACCENT = "#00796a"

export default function LandingPage() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <div style={{ background: ACCENT + "20" }} className="p-2 rounded-lg">
                            <img src="/image.png" alt="Logo" className="w-12 h-12 rounded-lg" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">TurboCafe</span>
                    </div>
                    <button
                        onClick={() => navigate('/auth')}
                        style={{ background: ACCENT }}
                        className="text-white px-6 py-2 rounded-lg hover:brightness-90 transition-colors font-medium"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                    Your Campus
                    <span style={{ color: ACCENT }}> Food Hub</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Connect students with local campus vendors. Order your favorite meals, skip the lines, and enjoy fresh food
                    with our smart ticketing system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                    onClick={() => navigate('/auth')}
                    style={{ background: ACCENT }}
                    className="text-white px-8 py-4 rounded-lg hover:brightness-90 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
                    >
                        <span>Start Ordering</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                    onClick={() => navigate('/auth')}
                    style={{ color: ACCENT, borderColor: ACCENT }}
                    className="bg-white border-2 px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg"
                    >
                        Join as Vendor
                    </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TurboCafe?</h2>
                    <p className="text-xl text-gray-600">Making campus dining simple and efficient</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6">
                        <div style={{ background: ACCENT + "20" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8" style={{ color: ACCENT }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Skip the Lines</h3>
                        <p className="text-gray-600">Order ahead and pick up when ready. No more waiting in long queues.</p>
                    </div>

                    <div className="text-center p-6">
                        <div style={{ background: ACCENT + "20" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8" style={{ color: ACCENT }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Support Local Vendors</h3>
                        <p className="text-gray-600">Connect with campus food vendors and support local businesses.</p>
                    </div>

                    <div className="text-center p-6">
                        <div style={{ background: ACCENT + "20" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8" style={{ color: ACCENT }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Food</h3>
                        <p className="text-gray-600">Fresh, delicious meals from trusted campus vendors.</p>
                    </div>

                    <div className="text-center p-6">
                        <div style={{ background: ACCENT + "20" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" style={{ color: ACCENT }} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Pickup</h3>
                        <p className="text-gray-600">Smart ticketing system for seamless food collection.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <p className="text-xl text-gray-600">Simple steps to get your favorite campus food</p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* For Students */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div style={{ background: ACCENT + "20" }} className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <Users className="w-6 h-6" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">For Students</h3>
                    <div className="space-y-4">
                        {[1,2,3,4].map((num, idx) => (
                            <div key={num} className="flex items-start space-x-4">
                                <div style={{ background: ACCENT, color: "#fff" }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {num}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        {["Browse Menus","Place Order","Get Ticket","Pickup Food"][idx]}
                                    </h4>
                                    <p className="text-gray-600">
                                        {[
                                            "Explore food options from various campus vendors",
                                            "Add items to cart and place your order",
                                            "Receive a pickup ticket with your order number",
                                            "Show your ticket and collect your fresh meal"
                                        ][idx]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* For Vendors */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div style={{ background: ACCENT + "20" }} className="w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <ShoppingBag className="w-6 h-6" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">For Vendors</h3>
                <div className="space-y-4">
                    {[1,2,3,4].map((num, idx) => (
                        <div key={num} className="flex items-start space-x-4">
                            <div style={{ background: ACCENT, color: "#fff" }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                {num}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">
                                    {["Setup Menu","Receive Orders","Prepare Food","Notify & Serve"][idx]}
                                </h4>
                                <p className="text-gray-600">
                                    {[
                                        "Add your dishes with prices and descriptions",
                                        "Get notified when students place orders",
                                        "Cook fresh meals for your customers",
                                        "Call customers when orders are ready"
                                    ][idx]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* CTA Section */}
        <section style={{ background: ACCENT }} className="py-20">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-orange-100 mb-8">
                Join thousands of students and vendors already using TurboCafe
            </p>
            <button
                onClick={() => navigate('/auth')}
                style={{ background: "#fff", color: ACCENT }}
                className="px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center space-x-2"
            >
                <span>Join TurboCafe Today</span>
                <ArrowRight className="w-5 h-5" />
            </button>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div style={{ background: ACCENT }} className="p-2 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">TurboCafe</span>
                </div>
                <div className="text-gray-400">
                <p>&copy; 2025 TurboCafe. Making campus dining better.</p>
                </div>
            </div>
            </div>
        </footer>
        </div>
    )
}
