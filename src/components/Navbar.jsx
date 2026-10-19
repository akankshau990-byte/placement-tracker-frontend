import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          Placement Tracker
        </Link>

        <div className="d-flex">
          {token ? (
            <>
              <Link className="btn btn-outline-light me-2" to="/dashboard">
                Dashboard
              </Link>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
              <button
                className="btn btn-outline-light me-2"
                onClick={() => navigate("/profile")}
              >
                👤 Profile
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light me-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
