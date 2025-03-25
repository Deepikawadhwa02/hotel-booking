process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
const bookingRoutes = require("./routes/booking.js")
const userRoutes = require("./routes/user.js")
const blogRoutes = require("./routes/Blog.js")
const reviewRoutes = require("./routes/Review.js")
const nearbyPlacesRoutes = require("./routes/nearbyPlaces.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static('public/uploads'));

// /* ROUTES */
app.use("/auth", authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings", bookingRoutes)
app.use("/users", userRoutes)
app.use("/blogs", blogRoutes);
app.use("/reviews", reviewRoutes);
app.use('/stripe', require('./routes/stripe'));
app.use('/', require('./routes/razarpay'));
app.use('/', require('./routes/Newsletter.js'));
app.use("/nearby", nearbyPlacesRoutes);

/* MONGOOSE SETUP */    
const PORT = 3001;
mongoose
  .connect('mongodb+srv://deepika24663:D8jRSEJMulPMVSSG@cluster0.jxlkr.mongodb.net/'
  )
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
