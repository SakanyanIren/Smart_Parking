import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/lo.png" alt="P" className="logo-img" />
          <span className="logo-name">ark Station</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            ԿԱՅԱՆԱՏԵՂԻ
          </Link>
          <Link
            to="/check-in"
            className={`nav-link ${isActive('/check-in') ? 'active' : ''}`}
          >
            ԻՄ ԱՄՐԱԳՐՈՒՄՆԵՐԸ
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-info">
            Մուտք <span className="user-name">{user?.name}</span>
          </span>
          <button className="logout-button" onClick={handleLogout}>
            ԵԼՔ
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
