import React from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutUs from './components/AboutUs.jsx';
import GalleryHighlights from './components/Gallery.jsx';
import UpcomingCamps from './components/UpcomingCamp.jsx';

function App() {
  return (
   <>
   <Navbar/>
   <HeroSection/>
   <AboutUs/>
   <GalleryHighlights/>
   <UpcomingCamps/>
   </>
  );
}

export default App;