import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../Components/Footer";


const coachData = [
                {
                    id: 1,
                    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=160&h=160",
                    title: "Part-Time Full Tennis Coach",
                    description: "Lead engaging lessons for all ages, focusing on skill development and fostering a love for the game. This seasonal role (Sept 4 - Dec 13, 2025) offers flexible afternoon and weekend hours. Potential for full-time extension in 2026. Pay ranges from $25-$50/hour based on experience.",
                    buttonText: "View Part-Time Coach Position"
                },
                {
                    id: 2,
                    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=160&h=160",
                    title: "Junior Coach / Mentor & Hitting Partner",
                    description: "Support our coaching team and provide valuable hitting practice to players. This part-time position in Foster City, CA offers a flexible, as-needed schedule at $20/hour. Ideal for aspiring coaches or experienced players looking to share their passion.",
                    buttonText: "View Junior Coach Position"
                }
            ];

export default function Career() {
//   const [showModal, setShowModal] = useState(false);
  return (
    <>
    <div className=" p-4  min-vh-100 d-flex align-items-center justify-content-center career-page-margin-top" style={{ backgroundColor:   "#d5d9ddff" }}>
      <div className="bg-[#1f1f1f] bg-opacity-25 custom-border-tl-br rounded-5 mx-3 text-light mt-4" style={{ maxWidth: 1200, width: "100%" }}>
        {/* Top image header */}
        <div className="mb-0  rounded-bottem overflow-hidden rounded-5">
          <img
            src="/images/Screenshot 2025-09-03 132752.png"
            alt="Tennis action"
            className=" w-full "
          />
          <div className="p-[50px] main-coach-card-text">

         
        
        <h1 className="fw-bold mb-2 font-size-lg text-white font-size-xl">Join Our Tennis <br /> Coaching Team</h1>
        <div className="mb-3 mt-4 coach-card-text">Bee Tennis Studios &amp; Zalles Racquet Sports - Foster City, CA</div>
        <div className="mb-3  coach-card-text">
          Welcome to Ace Tennis Studios & Zalles Racquet Sports! We are looking for passionate and skilled tennis coaches to join our team in Foster City, CA. Our mission is to share a love for tennis, develop playing potential, and build a vibrant community through high quality coaching experiences.
        </div>
        <div className="mb-4 coach-card-text">
          Explore the exciting opportunities below to become a part of our dedicated coaching staff.
        </div>

       
          <div className="coach-cards-container">
                    <div className="row g-4 mb-4 coach-row">
                        {coachData.map((coach) => (
                            <div key={coach.id} className="col-md-6">
                                <div className="card h-100 shadow-sm coach-card">
                                    <div className="card-body d-flex flex-column coach-card-body">
                                        <img 
                                            src={coach.image} 
                                            className="coach-thumbnail" 
                                            alt={coach.title}
                                        />
                                        <h5 className="card-title coach-card-title">
                                            {coach.title}
                                        </h5>
                                        <p className="card-text flex-grow-1 coach-card-text">
                                            {coach.description}
                                        </p>
                                        <a 
                                            href="#" 
                                            className="btn coach-btn mt-1"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                console.log(`Clicked: ${coach.buttonText}`);
                                            }}
                                        >
                                            {coach.buttonText}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

        <div className="mb-7  coach-card-text">
          Join our team with your passion and efforts for a collaborative, supportive culture where your potential can shine on and off court.
        </div>

        {/* Bottom row of images */}
         <div className="container-fluid p-3"  >
      <div className="row g-2">
        <div className="col-4">
          <img 
            src="images/2025-Tennis-Marketing-Photos-245.jpg" 
            alt="Tennis activity 1" 
            className="w-100 sports-image" 
            style={{
              height: '140px', 
              objectFit: 'cover', 
              borderRadius: '8px 12px 12px 8px',
              marginTop: '30px',
              // border: '2px solid #4a5568'
            }} 
          />
        </div>
        <div className="col-4">
          <img 
            src="images/2025-Tennis-Marketing-Photos-14.jpg" 
            alt="Tennis activity 2" 
            className="w-70 sports-image" 
            style={{
              height: '160px', 
              width: '70%',
              objectFit: 'cover', 
              borderRadius: '8px 12px 12px 8px',
              marginLeft:'15%',
              // border: '2px solid #4a5568'
            }} 
          />
        </div>
        <div className="col-4">
          <img 
            src="images/2025-Tennis-Marketing-Photos-2.jpg" 
            alt="Tennis activity 3" 
            className="w-100 sports-image" 
            style={{
              height: '160px', 
              objectFit: 'cover', 
              borderRadius: '8px 12px 12px 8px',
              // border: '2px solid #4a5568'
            }} 
          />
        </div>
      </div>
      </div>
      </div>
         </div>
          </div>
          
          </div>
          <Footer/>

    </>
  );
}
