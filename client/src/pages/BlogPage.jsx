import { useState } from "react";
import AddBlog from "../components/AddBlog";
import BlogList from "../components/BlogList";
import "../styles/BlogPage.scss";
import Navbar from "../components/Navbar";

const BlogPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleAdd = () => setRefresh(!refresh);

  return (
    <>    <Navbar />
    <div className="blog-page">
      <h1>Blog Page</h1>
      <div className="content">
        <AddBlog onAdd={handleAdd} />
        <BlogList key={refresh} onDelete={() => setRefresh(!refresh)} />
      </div>
    </div>
    </>
  );
};

export default BlogPage;
