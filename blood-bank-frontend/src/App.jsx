import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutUs from './components/AboutUs.jsx';
import GalleryHighlights from './components/Gallery.jsx';
import UpcomingCamps from './components/UpcomingCamp.jsx';
import Footer from './components/Footer.jsx';
import Login from './components/Login.jsx'; // Your login component
import DonorRegistration from './components/DonorRegistration.jsx';
import Dashboard from './components/Dashboard.jsx';

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
        <Route path="/Donor/register" element={<DonorRegistration/>}/>
        <Route path="/Dashboard" element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;