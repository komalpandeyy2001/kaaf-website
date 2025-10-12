import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './pages/HomePage'
import Programs from './pages/Programs'
import AllPrograms from './pages/AllPrograms'
import ProgramDetail from './pages/ProgramDetail'
import AllEvents from './pages/AllEvents'
import EventDetail from './pages/EventDetail'
import Header from '../Components/Header'
import Events from './pages/Events'
import BookClass from './pages/BookClass'
import RetailStore from './pages/RetailStore'
import PickleballTennis from './pages/PickleballTennis'
import RegistrationFlow from './pages/registrationFlow'
import PaymentPage from './pages/PaymentPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Orders from './pages/Orders'
import RegistrationsDashboard from './pages/RegistrationsDashboard'
import Profile from './pages/Profile'
import Account from './pages/Account'
import Terms from './pages/Terms'
import PaymentSuccess from './pages/PaymentSuccess'
import './auth-styles.css'
import Career from './pages/Career'


function App() {
  return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/all-programs" element={<AllPrograms />} />
          <Route path="/program/:id" element={<ProgramDetail />} />
          <Route path="/retail-store" element={<RetailStore />} />
          <Route path="/pickleball-tennis" element={<PickleballTennis />} />
          <Route path="/events" element={<Events />} />
          <Route path="/career" element={<Career/>} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/book-class" element={<BookClass />} />
          <Route path="/registration" element={<RegistrationFlow />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<Orders />} />
        <Route path="/registrations" element={<RegistrationsDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
      <ToastContainer />
    </Router>
  )
}

export default App
