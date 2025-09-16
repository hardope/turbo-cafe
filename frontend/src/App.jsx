import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/Auth'
import { Toaster } from 'sonner'
import StudentDashboard from './pages/students/dashboard'
import VendorDashboard from './pages/vendors/dashboard'
import AuthRoute from './components/authroute'

function App() {

	  return (
		<Router>
			<Toaster richColors position="top-right" />
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route path='/auth' element={<AuthPage />} />
				<Route path='students/dashboard' element={<AuthRoute><StudentDashboard /></AuthRoute>} />
				<Route path='vendors/dashboard' element={<AuthRoute><VendorDashboard /></AuthRoute>} />
			</Routes>
		</Router>
	)
}

export default App
