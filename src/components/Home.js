import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import AccountsService from "../services/accounts.service";
import CustomersService from "../services/customers.service";

const Home = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAccounts: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [showClientBoard, setShowClientBoard] = useState(false);
  const [showAgentGuichetBoard, setShowAgentGuichetBoard] = useState(false);
  const [showAgentGuichetGetBoard, setShowAgentGuichetGetBoard] = useState(false);

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
        console.error('Error parsing roles in Home:', error);
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
      
      // Charger les statistiques
      loadStats();
    }
    setLoading(false);
  }, []);

  const loadStats = async () => {
    try {
      const user = AuthService.getCurrentUser();
      const userRoles = user.roles || [];
      
      // Charger les statistiques selon les permissions
      if (userRoles.some(role => (typeof role === 'string' ? role : role.authority) === "GET_ALL_CUSTUMERS")) {
        try {
          const customersResponse = await CustomersService.getCustomers();
          setStats(prev => ({ ...prev, totalCustomers: customersResponse.data.length }));
        } catch (error) {
          console.error("Error loading customers stats:", error);
        }
      }
      
      if (userRoles.some(role => (typeof role === 'string' ? role : role.authority) === "GET_ALL_BANK_ACCOUNT")) {
        try {
          const accountsResponse = await AccountsService.getAccounts();
          setStats(prev => ({ ...prev, totalAccounts: accountsResponse.data.length }));
        } catch (error) {
          console.error("Error loading accounts stats:", error);
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="jumbotron bg-primary text-white p-4 rounded">
            <h1 className="display-4">Bienvenue dans Bank Service Multi-Connector</h1>
            <p className="lead">
              Plateforme bancaire moderne avec API REST, SOAP, GraphQL et gRPC
            </p>
            {currentUser && (
              <p className="mb-0">
                Connecté en tant que : <strong>{currentUser.username}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="row mt-4">
          {/* Statistiques pour les agents guichet */}
          {(showAgentGuichetBoard || showAgentGuichetGetBoard) && (
            <>
              <div className="col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-people-fill"></i> Clients
                    </h5>
                    <h2 className="text-primary">{stats.totalCustomers}</h2>
                    <p className="card-text">Total clients</p>
                    {showAgentGuichetBoard && (
                      <Link to="/manage_customers" className="btn btn-outline-primary btn-sm">
                        Gérer les clients
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-bank"></i> Comptes
                    </h5>
                    <h2 className="text-success">{stats.totalAccounts}</h2>
                    <p className="card-text">Total comptes bancaires</p>
                    <Link to="/manage_bankaccounts" className="btn btn-outline-success btn-sm">
                      Voir les comptes
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-arrow-left-right"></i> Transactions
                    </h5>
                    <h2 className="text-info">{stats.totalTransactions}</h2>
                    <p className="card-text">Total transactions</p>
                    {showAgentGuichetBoard && (
                      <Link to="/add_wirer_transfer" className="btn btn-outline-info btn-sm">
                        Nouveau virement
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Section pour les clients */}
          {showClientBoard && !showAgentGuichetBoard && !showAgentGuichetGetBoard && (
            <div className="col-md-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">Espace Client</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Mes services bancaires</h6>
                      <ul className="list-group">
                        <li className="list-group-item">
                          <Link to="/consult_account" className="text-decoration-none">
                            <i className="bi bi-search"></i> Consulter mes comptes
                          </Link>
                        </li>
                        <li className="list-group-item">
                          <Link to="/add_wirer_transfer" className="text-decoration-none">
                            <i className="bi bi-arrow-left-right"></i> Effectuer un virement
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>Informations du compte</h6>
                      <p>
                        <strong>Utilisateur:</strong> {currentUser.username}<br />
                        <strong>Email:</strong> {currentUser.email || 'Non renseigné'}<br />
                        <strong>Type:</strong> Client
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section d'information générale */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Services Disponibles</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <h4 className="text-primary">REST API</h4>
                    <p>API RESTful pour les opérations bancaires</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <h4 className="text-success">SOAP API</h4>
                    <p>Services web SOAP pour l'intégration entreprise</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <h4 className="text-info">GraphQL</h4>
                    <p>API GraphQL flexible et performante</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <h4 className="text-warning">gRPC</h4>
                    <p>Communication gRPC haute performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      {currentUser && (
        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Actions Rapides</h5>
              </div>
              <div className="card-body">
                <div className="btn-group" role="group">
                  {showAgentGuichetBoard && (
                    <>
                      <Link to="/manage_customers" className="btn btn-primary">
                        <i className="bi bi-person-plus"></i> Nouveau Client
                      </Link>
                      <Link to="/manage_bankaccounts" className="btn btn-success">
                        <i className="bi bi-bank2"></i> Nouveau Compte
                      </Link>
                    </>
                  )}
                  {showClientBoard && (
                    <Link to="/consult_account" className="btn btn-info">
                      <i className="bi bi-search"></i> Mes Comptes
                    </Link>
                  )}
                  <Link to="/profile" className="btn btn-secondary">
                    <i className="bi bi-person"></i> Mon Profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

