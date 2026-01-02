import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth.service";

const NavBar = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [showClientBoard, setShowClientBoard] = useState(false);
  const [showAgentGuichetBoard, setShowAgentGuichetBoard] = useState(false);
  const [showAgentGuichetGetBoard, setShowAgentGuichetGetBoard] =
    useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Parser les rôles correctement depuis le token
      let userRoles = [];
      try {
        if (user.roles && Array.isArray(user.roles)) {
          userRoles = userRoles.concat(user.roles);
        } else if (user.roles && typeof user.roles === 'string') {
          const parsedRoles = JSON.parse(user.roles);
          if (Array.isArray(parsedRoles)) {
            userRoles = userRoles.concat(parsedRoles);
          }
        }
      } catch (error) {
        console.error('Error parsing roles in NavBar:', error);
      }
      
      // Normaliser les rôles en chaînes de caractères
      const normalizedRoles = userRoles.map(role => 
        typeof role === 'string' ? role : role.authority || ''
      ).filter(role => role !== '');
      
      setShowClientBoard(
        normalizedRoles.includes("ROLE_CLIENT") || user.username === "admin"
      );
      setShowAgentGuichetBoard(
        normalizedRoles.includes("ROLE_AGENT_GUICHET") || user.username === "admin"
      );
      setShowAgentGuichetGetBoard(
        (normalizedRoles.includes("ROLE_AGENT_GUICHET_GET") || user.username === "admin")
      );
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowClientBoard(false);
    setShowAgentGuichetBoard(false);
    setShowAgentGuichetGetBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <Link to={"/"} className="navbar-brand">
        <i className="bi bi-bank2 me-2"></i>Imad&Rania Java 2026
      </Link>
      <div className="navbar-nav mr-auto">
        <li className="nav-item">
          <Link to={"/home"} className="nav-link">
            <i className="bi bi-house-door me-1"></i>Home
          </Link>
        </li>
        {(showAgentGuichetBoard || showAgentGuichetGetBoard) && (
          <>
            <li className="nav-item">
              <Link to={"/manage_customers"} className="nav-link">
                <i className="bi bi-people me-1"></i>Customers Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/manage_bankaccounts"} className="nav-link">
                <i className="bi bi-credit-card me-1"></i>Bank Accounts Management
              </Link>
            </li>
          </>
        )}
        {showClientBoard && (
          <>
            <li className="nav-item">
              <Link to={"/consult_account"} className="nav-link">
                <i className="bi bi-wallet2 me-1"></i>My Bank Account
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/add_wirer_transfer"} className="nav-link">
                <i className="bi bi-arrow-left-right me-1"></i>Wired Transfer
              </Link>
            </li>
          </>
        )}
        {currentUser && (
          <li className="nav-item">
            <Link to={"/profile"} className="nav-link">
              <i className="bi bi-person-circle me-1"></i>Profile
            </Link>
          </li>
        )}
      </div>
      {currentUser ? (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to={"/profile"} className="nav-link">
              <i className="bi bi-person me-1"></i>
              {currentUser.username}
            </Link>
          </li>
          <li className="nav-item">
            <a href="/login" className="nav-link" onClick={logOut}>
              <i className="bi bi-box-arrow-right me-1"></i>LogOut
            </a>
          </li>
        </div>
      ) : (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to={"/login"} className="nav-link">
              <i className="bi bi-box-arrow-in-right me-1"></i>Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/register"} className="nav-link">
              <i className="bi bi-person-plus me-1"></i>Sign Up
            </Link>
          </li>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

