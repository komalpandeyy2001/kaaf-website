import React from 'react';

const Terms = () => {
  return (
    <div className="container-fluid py-5 my-5 bg-light">
      <div className=" justify-content-center">
        <div className="">
          <div className="card shadow">
            <div className="card-header bg-yellow text-center">
              <h3 className="mb-0 text-dark">Terms and Policy</h3>
            </div>
            <div className="card-body">
              <h3>Terms of Service</h3>
              <p>Welcome to Kaaf! By using our website and services, you agree to the following terms:</p>
              <ul>
                <li>Use our services responsibly and in compliance with applicable laws.</li>
                <li>Respect the rights of other users and our intellectual property.</li>
                <li>Provide accurate information when registering or making purchases.</li>
                <li>Do not engage in any harmful or illegal activities on our platform.</li>
              </ul>

              <h3>Privacy Policy</h3>
              <p>We are committed to protecting your privacy. Our privacy practices include:</p>
              <ul>
                <li>Collecting only necessary information for providing our services.</li>
                <li>Using secure methods to store and transmit your data.</li>
                <li>Not sharing your personal information with third parties without your consent.</li>
                <li>Providing you with control over your data and the ability to request deletion.</li>
              </ul>

              <h3>Contact Us</h3>
              <p>If you have any questions about these terms or our policies, please contact us at support@kaaf.com.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
