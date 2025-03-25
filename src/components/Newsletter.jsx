import "../styles/Newsletter.scss";

const Newsletter = () => {
  return (
    <div className="newsletter">
      <div className="newsletter_content">
        <div className="newsletter_text">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Stay updated with the latest news and offers.</p>
          <form className="newsletter_form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
        <div className="newsletter_image">
          <img src="/assets/newsletter.jpg" alt="Newsletter" />
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
