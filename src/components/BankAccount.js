import React, { useState, useEffect } from "react";
import AccountsService from "../services/accounts.service";
import AuthService from "../services/auth.service";

const BankAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchRib, setSearchRib] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [showAgentGuichetBoard, setShowAgentGuichetBoard] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      // Gérer le cas où les rôles ne sont pas définis dans le token
      const roles = user.roles || [];
      setShowAgentGuichetBoard(
        roles.includes("ROLE_AGENT_GUICHET") || 
        roles.includes("ROLE_AGENT_GUICHET_GET") ||
        user.username === "admin" // Donner accès à l'admin par défaut
      );
    }
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await AccountsService.getAccounts();
      setAccounts(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des comptes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchRib.trim()) {
      setSearchResult(null);
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const response = await AccountsService.getAccountByRib(searchRib);
      setSearchResult(response.data);
    } catch (err) {
      setError("Compte non trouvé");
      setSearchResult(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Comptes Bancaires</h2>
      
      {showAgentGuichetBoard && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Rechercher un compte par RIB</h5>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Entrez le RIB"
                value={searchRib}
                onChange={(e) => setSearchRib(e.target.value)}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSearch}
                disabled={loading}
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      
      {searchResult && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            Résultat de la recherche
          </div>
          <div className="card-body">
            <p><strong>RIB:</strong> {searchResult.rib}</p>
            <p><strong>Type:</strong> {searchResult.type}</p>
            <p><strong>Solde:</strong> {formatCurrency(searchResult.balance)}</p>
            <p><strong>Date de création:</strong> {new Date(searchResult.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Liste des comptes</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Chargement...</span>
              </div>
            </div>
          ) : accounts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>RIB</th>
                    <th>Type</th>
                    <th>Solde</th>
                    <th>Date de création</th>
                    {showAgentGuichetBoard && <th>Client</th>}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => (
                    <tr key={account.rib || index}>
                      <td>{account.rib}</td>
                      <td>{account.type}</td>
                      <td className={account.balance < 0 ? "text-danger" : "text-success"}>
                        {formatCurrency(account.balance)}
                      </td>
                      <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                      {showAgentGuichetBoard && (
                        <td>{account.customer?.name || "N/A"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">Aucun compte trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccount;

