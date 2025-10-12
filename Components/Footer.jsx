import { FiFacebook } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { BiPhoneCall } from "react-icons/bi";
import { FaRegEnvelope } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer bg-dark text-white py-5">
            <div className="container">
                <div className="row g-4 text-center text-md-start">

                    {/* Brand Info */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h2 className="text-yellow fw-bold">Bee Tennis Studio</h2>
                        <h5 className="mb-2">California</h5>
                        <p className="text-gray fs-6">
                            Building skills, character, and champions since 2016
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-6 col-md-6 col-lg-3">
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className="list-unstyled fs-6">
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Home</Link></li>
                            <li className="mb-2"><Link to="/programs" className="text-white text-decoration-none">Programs</Link></li>
                            <li className="mb-2"><a href="http://zallesracquetsports.com" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none">Retail Store</a></li>
                            <li className="mb-2"><Link to="/pickleball-tennis" className="text-white text-decoration-none">Pickleball & Tennis</Link></li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div className="col-6 col-md-6 col-lg-3">
                        <h5 className="fw-bold mb-3">Programs</h5>
                        <ul className="list-unstyled fs-6">
                            <li className="mb-2"><Link to="/programs" className="text-white text-decoration-none">Summer Camp</Link></li>
                            <li className="mb-2"><Link to="/programs" className="text-white text-decoration-none">Private Lessons</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h5 className="fw-bold mb-3">Contact Us</h5>
                        <p className="mb-2 fs-6 d-flex align-items-center justify-content-center justify-content-md-start">
                            <MdOutlineLocationOn className="me-2" /> Foster City, California
                        </p>
                        <p className="mb-2 fs-6 d-flex align-items-center justify-content-center justify-content-md-start">
                            <BiPhoneCall className="me-2" /> (206) 555-1234
                        </p>
                        <p className="mb-2 fs-6 d-flex align-items-center justify-content-center justify-content-md-start">
                            <FaRegEnvelope className="me-2" /> info@beetennisstudio.com
                        </p>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="row mt-4">
                    <div className="col text-center">
                        <div className="d-flex justify-content-center gap-3 fs-4">
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
                </div>
            </div>
        </footer>
    );
}

export default Footer;
