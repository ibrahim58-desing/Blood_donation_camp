import { FaHeartbeat, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-b from-red-900 to-red-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo and Description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center">
                <FaHeartbeat className="text-red-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  M<span className="text-red-300">EGA</span>
                </h1>
                <p className="text-red-200 text-sm">Medical Emergency Group Association</p>
              </div>
            </div>
            <p className="text-red-100 leading-relaxed">
              We are dedicated to saving lives through blood donation camps, emergency medical services, and community health initiatives across Kolar district.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebook />, color: 'hover:text-blue-400', label: 'Facebook' },
                { icon: <FaTwitter />, color: 'hover:text-blue-300', label: 'Twitter' },
                { icon: <FaInstagram />, color: 'hover:text-pink-400', label: 'Instagram' },
                { icon: <FaYoutube />, color: 'hover:text-red-400', label: 'YouTube' },
                { icon: <FaLinkedin />, color: 'hover:text-blue-500', label: 'LinkedIn' },
                { icon: <FaWhatsapp />, color: 'hover:text-green-400', label: 'WhatsApp' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`w-10 h-10 bg-red-800/50 rounded-full flex items-center justify-center 
                    transition-all duration-300 hover:bg-white hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '#' },
                { name: 'Blood Donation Camps', href: '#' },
                { name: 'Become a Donor', href: '#' },
                { name: 'Emergency Request', href: '#' },
                { name: 'Our Volunteers', href: '#' },
                { name: 'Success Stories', href: '#' },
                { name: 'Partner with Us', href: '#' },
                { name: 'Contact Us', href: '#' }
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-red-100 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
              Emergency Contacts
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-800/30 rounded-full flex items-center justify-center mt-1">
                  <FaPhone className="text-red-300" />
                </div>
                <div>
                  <p className="font-semibold">24/7 Emergency Helpline</p>
                  <a href="tel:+911080123456" className="text-red-100 hover:text-white text-lg font-bold">
                    1080-123-456
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-800/30 rounded-full flex items-center justify-center mt-1">
                  <FaWhatsapp className="text-green-300" />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp Support</p>
                  <a href="https://wa.me/911234567890" className="text-red-100 hover:text-white text-lg font-bold">
                    +91 12345 67890
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-800/30 rounded-full flex items-center justify-center mt-1">
                  <AiOutlineMail className="text-red-300 text-xl" />
                </div>
                <div>
                  <p className="font-semibold">Email Support</p>
                  <a href="mailto:emergency@mega.org" className="text-red-100 hover:text-white">
                    emergency@mega.org
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
              Our Location
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-800/30 rounded-full flex items-center justify-center mt-1">
                  <FaMapMarkerAlt className="text-red-300" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Headquarters</p>
                  <p className="text-red-100">
                    Medical Emergency Complex<br />
                    Kolar Gold Fields Road<br />
                    Kolar, Karnataka 563101
                  </p>
                </div>
              </div>
              
              {/* Blood Camp Schedule */}
              <div className="bg-red-800/30 rounded-xl p-4 mt-6">
                <h4 className="font-bold mb-2 text-white">Next Blood Donation Camp</h4>
                <p className="text-red-100 text-sm mb-2">
                  📅 Saturday, 25th November 2023<br />
                  ⏰ 9:00 AM - 5:00 PM<br />
                  📍 Government Hospital, Kolar
                </p>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors mt-2">
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-red-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Our Blood Camps</h3>
            <p className="text-red-200 mb-6">Subscribe to get notifications about upcoming blood donation camps and emergency alerts</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-lg bg-red-800/30 border border-red-700 text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-red-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-red-300 text-center md:text-left mb-4 md:mb-0">
              <p>© Copyright {currentYear} MEGA - Medical Emergency Group Association. All Rights Reserved.</p>
              <p className="text-sm mt-1">A non-profit organization registered under Karnataka Societies Act</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-red-300 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-red-300 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-red-300 hover:text-white transition-colors">Blood Safety Guidelines</a>
              <a href="#" className="text-red-300 hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-red-900/50 flex items-center space-x-2 animate-pulse font-bold">
          <FaHeartbeat className="text-xl" />
          <span>EMERGENCY: CALL 1080</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;