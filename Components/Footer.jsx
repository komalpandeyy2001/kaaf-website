import { FiFacebook } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";


function Footer() {
  return (
    <footer className="bg-dark text-white py-2">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        
        {/* Logo */}
        <div className="mb-2 mb-md-0 logo">
          <img src="/kaaflogo.png" alt="kaaf logo" />
        </div>

        {/* Contact Info */}
        <div className="mb-2 mb-md-0 text-center text-md-start">
          <span className="me-2">📧 kaaf@gmail.com</span> | 
          <span className="mx-2">📞 +91 12345 67890</span> | 
          <span className="ms-2">🌐 www.kaaf.com</span>
        </div>

        {/* Social Icons */}
        <div className="d-flex gap-2 fs-5">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FiFacebook />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaInstagram />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <AiOutlineYoutube />
          </a>
        </div>
      </div>

      {/* Thin Copyright */}
      <div className="text-center mt-1 fs-6" style={{ fontSize: "0.75rem" }}>
        &copy; {new Date().getFullYear()} KAAF. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
