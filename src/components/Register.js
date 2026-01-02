import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import AuthService from "../services/auth.service";

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Ce champ est obligatoire!
      </div>
    );
  }
};

const validEmail = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-envelope-x me-2"></i>
        Cet email n'est pas valide.
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-person-x me-2"></i>
        Le nom d'utilisateur doit contenir entre 3 et 20 caractères.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-shield-x me-2"></i>
        Le mot de passe doit contenir entre 6 et 40 caractères.
      </div>
    );
  }
};

const Register = () => {
  const form = useRef();
  const checkBtn = useRef();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessful(false);
    form.current.validateAll();
    if (checkBtn.current.context._errors.length === 0) {
      AuthService.register(username, password, email)
        .then((response) => {
          setMessage(response.data);
          setSuccessful(true);
        })
        .catch((error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          setMessage(resMessage);
          setSuccessful(false);
        });
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        {/* Icône SVG moderne pour l'inscription */}
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
              d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
              stroke="#198754"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
              stroke="#198754"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 11C22 12.0609 21.5786 13.0783 20.8284 13.8284C20.0783 14.5786 19.0609 15 18 15"
              stroke="#198754"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3C17.0609 3 18.0783 3.42143 18.8284 4.17157C19.5786 4.92172 20 5.93913 20 7"
              stroke="#198754"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-success">Créer un compte</h3>
          <p className="text-muted">Rejoignez IR Bank 2026</p>
        </div>
        
        <Form onSubmit={handleRegister} ref={form}>
          {!successful && (
            <div>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="bi bi-person-fill me-2"></i>Nom d'utilisateur
                </label>
                <Input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Choisissez un nom d'utilisateur"
                  value={username}
                  onChange={onChangeUsername}
                  validations={[required, vusername]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="bi bi-envelope-fill me-2"></i>Email
                </label>
                <Input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={onChangeEmail}
                  validations={[required, validEmail]}
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
                  placeholder="Choisissez un mot de passe"
                  value={password}
                  onChange={onChangePassword}
                  validations={[required, vpassword]}
                />
              </div>
              
              <div className="form-group">
                <button className="btn btn-success btn-block w-100">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  S'inscrire
                </button>
              </div>
            </div>
          )}
          
          {message && (
            <div className="form-group">
              <div
                className={
                  successful ? "alert alert-success" : "alert alert-danger"
                }
                role="alert"
              >
                {successful ? (
                  <><i className="bi bi-check-circle-fill me-2"></i>{message}</>
                ) : (
                  <><i className="bi bi-exclamation-triangle-fill me-2"></i>{message}</>
                )}
              </div>
            </div>
          )}
          
          {!successful && (
            <div className="text-center mt-3">
              <small className="text-muted">
                Déjà un compte? <Link to="/login" className="text-success">Se connecter</Link>
              </small>
            </div>
          )}
          
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
  );
};

export default Register;

