import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import AuthService from "../services/auth.service";

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        Ce champ est obligatoire!
      </div>
    );
  }
};

const Login = () => {
  let navigate = useNavigate();
  const form = useRef();
  const checkBtn = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    form.current.validateAll();
    if (checkBtn.current.context._errors.length === 0) {
      AuthService.login(username, password)
        .then(() => {
          navigate("/home");
          window.location.reload();
        })
        .catch((error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          setLoading(false);
          setMessage(resMessage);
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        {/* Icône SVG moderne pour la banque */}
        <div className="text-center mb-4">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3"
          >
            <path
              d="M3 21L21 21"
              stroke="#0d6efd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 21L5 9L19 9L19 21"
              stroke="#0d6efd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 9L12 3L19 9"
              stroke="#0d6efd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21L9 13L15 13L15 21"
              stroke="#0d6efd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-primary">IR Bank 2026</h3>
          <p className="text-muted">Connectez-vous à votre espace bancaire</p>
        </div>
        
        <Form onSubmit={handleLogin} ref={form}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <i className="bi bi-person-fill me-2"></i>Nom d'utilisateur
            </label>
            <Input
              type="text"
              className="form-control"
              name="username"
              placeholder="Entrez votre nom d'utilisateur"
              value={username}
              onChange={onChangeUsername}
              validations={[required]}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock-fill me-2"></i>Mot de passe
            </label>
            <Input
              type="password"
              className="form-control"
              name="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={onChangePassword}
              validations={[required]}
            />
          </div>
          
          <div className="form-group">
            <button className="btn btn-primary btn-block w-100" disabled={loading}>
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Se connecter
            </button>
          </div>
          
          {message && (
            <div className="form-group">
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {message}
              </div>
            </div>
          )}
          
          <div className="text-center mt-3">
            <small className="text-muted">
              Pas encore de compte? <Link to="/register" className="text-primary">Créer un compte</Link>
            </small>
          </div>
          
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
  );
};

export default Login;

