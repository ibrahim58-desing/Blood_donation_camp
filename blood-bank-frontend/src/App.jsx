import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutUs from './components/AboutUs.jsx';
import GalleryHighlights from './components/Gallery.jsx';
import UpcomingCamps from './components/UpcomingCamp.jsx';
import Footer from './components/Footer.jsx';
import Login from './components/Login.jsx';
import Gallery from './components/Gallery_2.jsx';
import AboutUs_2 from './components/AboutUs_2';

// Dashboard Layout & Components
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import DashboardHome from './components/dashboard/DashboardHome.jsx';

// Donor Components
import DonorRegistration from './components/donors/DonorRegistration.jsx';
import DonorList from './components/donors/DonorList.jsx';
import EligibleDonors from './components/donors/EligibleDonors.jsx';
import DonationHistory from './components/donors/DonationHistory.jsx';
import RecordDonation from './components/donors/RecordDonation.jsx';

// Inventory Components
import BloodUnitList from './components/inventory/BloodUnitList.jsx';
import AddBloodUnit from './components/inventory/AddBloodUnit.jsx';
import ExpiringUnits from './components/inventory/ExpiringUnits.jsx';
import DiscardExpired from './components/inventory/DiscardExpired.jsx';

// volunteer Components
import VolunteerRegistration from './components/volunteers/VolunteerRegistration';
import VolunteerList from './components/volunteers/VolunteerList';
import VolunteerDetails from './components/volunteers/VolunteerDetails';
import CampList from './components/volunteers/CampList';

// Request Components
import BloodRequestList from './components/requests/BloodRequestList.jsx';
import RequestRegistration from './components/requests/RequestRegistration.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Website Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <HeroSection />
            <AboutUs />
            <GalleryHighlights />
            <UpcomingCamps />
            <Footer />
          </>
        } />

        {/* // Add this route with your other main website routes */}
        <Route path="/gallery" element={
          <>
            <Navbar />
            <Gallery />
            <Footer />
          </>
        } />

        <Route path="/about" element={
          <>
            <Navbar />
            <AboutUs_2 />
            <Footer />
          </>
        } />

        {/* ✅ PUBLIC VOLUNTEER REGISTRATION - NO LOGIN REQUIRED */}
        <Route path="/volunteer/register" element={
          <>
            <Navbar />
            <div className="pt-20 min-h-screen bg-gray-50">
              <VolunteerRegistration />
            </div>
            <Footer />
          </>
        } />


        {/* PUBLIC REQUEST ROUTE - NO LOGIN REQUIRED */}
        <Route path="/requests/new" element={
          <>
            <Navbar />
            <div className="pt-20 min-h-screen bg-gray-50">
              <RequestRegistration />
            </div>
            <Footer />
          </>
        } />

        {/* Login Page Route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard Layout - Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Overview */}
          <Route index element={<DashboardHome />} />

          {/* Donor Management Routes */}
          <Route path="donors" element={<DonorList />} />
          <Route path="donors/register" element={<DonorRegistration />} />
          <Route path="donors/eligible" element={<EligibleDonors />} />
          <Route path="donors/donations" element={<DonationHistory />} />
          <Route path="donors/record-donation" element={<RecordDonation />} />

          {/* Inventory Management Routes */}
          <Route path="inventory" element={<BloodUnitList />} />
          <Route path="inventory/add" element={<AddBloodUnit />} />
          <Route path="inventory/expiring" element={<ExpiringUnits />} />
          <Route path="inventory/discard" element={<DiscardExpired />} />

          {/* ✅ VOLUNTEER MANAGEMENT ROUTES - PROTECTED (INSIDE DASHBOARD) */}
          <Route path="volunteers" element={<VolunteerList />} />        {/* /dashboard/volunteers */}
          <Route path="volunteers/:id" element={<VolunteerDetails />} /> {/* /dashboard/volunteers/123 */}
          <Route path="camps" element={<CampList />} />

          {/* Request Management Routes - Inside Dashboard (for staff) */}
          <Route path="requests" element={<BloodRequestList />} />
        </Route>

        {/* ✅ REDIRECTS - Add this section */}
        <Route path="/request" element={<Navigate to="/requests/new" replace />} />
        <Route path="/requests" element={<Navigate to="/requests/new" replace />} />
        <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/donors" element={<Navigate to="/dashboard/donors" replace />} />
      </Routes>
    </Router>
  );
}

export default App;