import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutUs from './components/AboutUs.jsx';
import GalleryHighlights from './components/Gallery.jsx';
import UpcomingCamps from './components/UpcomingCamp.jsx';
import Footer from './components/Footer.jsx';
import Login from './components/Login.jsx';

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
// import InventorySummary from './components/inventory/InventorySummary.jsx';

// Request Components
import BloodRequestList from './components/requests/BloodRequestList.jsx'
// import BloodRequestList from './components/requests/BloodRequestList.jsx';
// import RequestorList from './components/requests/RequestorList.jsx';

// Report Components
// import DonationReports from './components/reports/DonationReports.jsx';
// import InventoryReports from './components/reports/InventoryReports.jsx';
// import RequestReports from './components/reports/RequestReports.jsx';

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

        {/* Login Page Route */}
        <Route path="/login" element={<Login />} />

        {/* NEW DASHBOARD LAYOUT WITH NESTED ROUTES - REPLACES OLD DASHBOARD */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Overview - Default route */}
          <Route index element={<DashboardHome />} />

          {/* Donor Management Routes */}
          <Route path="donors" element={<DonorList />} />
          <Route path="donors/register" element={<DonorRegistration />} />
          <Route path="donors/eligible" element={<EligibleDonors />} />
          <Route path="donors/donations" element={<DonationHistory />} />
          <Route path="donors/record-donation" element={<RecordDonation />} />

          {/* Inventory Management Routes */}
          <Route path="inventory/add" element={<AddBloodUnit />} />
          <Route path="inventory" element={<BloodUnitList />} />
          <Route path="inventory/expiring" element={<ExpiringUnits />} />
          
           <Route path="inventory/discard" element={<DiscardExpired />} />
          {/*<Route path="inventory/summary" element={<InventorySummary />} /> */}

          {/* Request Management Routes */}
          <Route path="requests" element={<BloodRequestList />} />
           {/*<Route path="requests/pending" element={<BloodRequestList status="pending" />} />
          <Route path="requests/fulfilled" element={<BloodRequestList status="fulfilled" />} />
          <Route path="requestors" element={<RequestorList />} /> */}

          {/* Reports Routes */}
          {/* <Route path="reports/donations" element={<DonationReports />} />
          <Route path="reports/inventory" element={<InventoryReports />} />
          <Route path="reports/requests" element={<RequestReports />} /> */}
        </Route>

        {/* Optional: Redirect old /Dashboard to new /dashboard */}
        {/* <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/donors" element={<Navigate to="/dashboard/donors" replace />} /> */}

      </Routes>
    </Router>
  );
}

export default App;