import React, { useState } from "react";
import AccountsService from "../services/accounts.service";
import AuthService from "../services/auth.service";

const WirerTransfert = () => {
  const [transferData, setTransferData] = useState({
    fromRib: "",
    toRib: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAgentGuichetBoard, setShowAgentGuichetBoard] = useState(false);

  React.useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!transferData.fromRib.trim()) {
      setError("Le RIB du compte émetteur est requis");
      return false;
    }
    if (!transferData.toRib.trim()) {
      setError("Le RIB du compte destinataire est requis");
      return false;
    }
    if (!transferData.amount || parseFloat(transferData.amount) <= 0) {
      setError("Le montant doit être supérieur à 0");
      return false;
    }
    if (transferData.fromRib === transferData.toRib) {
      setError("Les comptes émetteur et destinataire doivent être différents");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await AccountsService.transfer(
        transferData.fromRib,
        transferData.toRib,
        parseFloat(transferData.amount)
      );
      
      setSuccess("Virement effectué avec succès!");
      setTransferData({
        fromRib: "",
        toRib: "",
        amount: ""
      });
      setShowConfirmation(false);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du virement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelTransfer = () => {
    setShowConfirmation(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (!showAgentGuichetBoard) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Accès restreint</h4>
          <p>Seuls les agents guichet peuvent effectuer des virements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Virement Bancaire</h2>
      
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Nouveau virement</h5>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fromRib" className="form-label">
                    Compte émetteur (RIB)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fromRib"
                    name="fromRib"
                    value={transferData.fromRib}
                    onChange={handleChange}
                    placeholder="Entrez le RIB du compte à débiter"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="toRib" className="form-label">
                    Compte destinataire (RIB)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="toRib"
                    name="toRib"
                    value={transferData.toRib}
                    onChange={handleChange}
                    placeholder="Entrez le RIB du compte à créditer"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Montant (€)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={transferData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                    <span className="input-group-text">€</span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Traitement en cours...
                      </>
                    ) : (
                      "Effectuer le virement"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation du virement</h5>
                <button type="button" className="btn-close" onClick={cancelTransfer}></button>
              </div>
              <div className="modal-body">
                <h6>Veuillez confirmer les détails du virement:</h6>
                <ul>
                  <li><strong>Compte émetteur:</strong> {transferData.fromRib}</li>
                  <li><strong>Compte destinataire:</strong> {transferData.toRib}</li>
                  <li><strong>Montant:</strong> {formatCurrency(parseFloat(transferData.amount))}</li>
                </ul>
                <p className="text-warning">Cette opération est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelTransfer}>
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmTransfer}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Traitement...
                    </>
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WirerTransfert;

