import React from 'react'
import Home from '../pages/Home'
import Services from '../pages/Services'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import Contact from '../pages/Contact'
import Doctors from '../pages/Doctors/Doctors'
import DoctorDetails from '../pages/Doctors/DoctorDetails'
import MyAccount from '../Dashboard/user-account/MyAccount'
import Dashboard from '../Dashboard/doctor-account/Dashboard'
import AdminDashboard from '../Dashboard/admin-account/Dashboard'
import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import {Routes,Route} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/doctors" element={<Doctors/>}/>
      <Route path="/doctors/:id" element={<DoctorDetails/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Signup/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/services" element={<Services/>}/>
      <Route path="/users/profile/me" element={<ProtectedRoute allowedRoles={['patient']}><MyAccount/></ProtectedRoute>}/>
      <Route path="/doctors/profile/me" element={<ProtectedRoute allowedRoles={['doctor']}><Dashboard/></ProtectedRoute>}/>
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard/></ProtectedRoute>}/>
      <Route path="/403" element={<Forbidden/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  )
}

export default Routers
