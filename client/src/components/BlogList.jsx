import { useState, useEffect } from "react";
import "../styles/BlogList.scss";
const BlogList = ({ onDelete }) => {
  const [blogs, setBlogs] = useState([]);
  const [editBlog, setEditBlog] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data));
  }, [blogs]);

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:3001/blogs/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      onDelete();
    }
  };

  const handleEdit = (blog) => {
    setEditBlog(blog);
  };

  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <div className="blog-card" key={blog._id}>
          {editBlog && editBlog._id === blog._id ? (
            <EditBlog blog={editBlog} setEditBlog={setEditBlog} />
          ) : (
            <>
              <h2>{blog.title}</h2>
              <p>{blog.content}</p>
              <p className="author">By: {blog.author}</p>
              <button onClick={() => handleEdit(blog)}>Edit</button>
              <button onClick={() => handleDelete(blog._id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const EditBlog = ({ blog, setEditBlog }) => {
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [author, setAuthor] = useState(blog.author);

  const handleUpdate = async () => {
    const response = await fetch(`http://localhost:3001/blogs/${blog._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, author }),
    });

    if (response.ok) {
      setEditBlog(null);
    }
  };

  return (
    <div className="edit-blog">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <button onClick={handleUpdate}>Save</button>
      <button onClick={() => setEditBlog(null)}>Cancel</button>
    </div>
  );
};

export default BlogList;
