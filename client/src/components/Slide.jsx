import React from "react";
import "../styles/Slide.scss";

const Slide = () => {
  return (
    <div className="slide">
      <video autoPlay muted loop className="slide_video">
        <source src="/assets/slide.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
     
    </div>
  );
};

export default Slide;




// import "../styles/Slide.scss"

// const Slide = () => {
//   return (
//     <div className="slide">
//       <h1>
//         Welcome Home! Anywhere you roam <br /> Stay in the moment. Make your
//         memories
//       </h1>
//     </div>
//   );
// };

// export default Slide;