import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import './SessionSummaryPage.css';

const SessionSummaryPage = () => {
  const [date, setDate] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const todayStr = getToday();
    setDate(todayStr);
    const fetchTodaySessions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const data = await ApiService.getSessionsByDate(token, todayStr);
        setSessions(data);
      } catch (err) {
        setError(err.message || 'Échec du chargement des sessions');
      }
      setLoading(false);
    };
    fetchTodaySessions();
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const data = await ApiService.getSessionsByDate(token, date);
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Échec du chargement des sessions');
    }
    setLoading(false);
  };

  const handleSessionClick = (sessionId) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  return (
    <div className="sessions-container">
      <p className="sessions-seal">✦</p>
      <h1 className="sessions-heading">Historique des sessions</h1>
      <p className="sessions-subtext">Récapitulatif par date</p>

      <div className="sessions-date-row">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="sessions-date-input"
        />
        <button onClick={handleFetch} className="sessions-fetch-btn">Rechercher</button>
      </div>

      {loading && <p className="sessions-status">Chargement...</p>}
      {error && <p className="sessions-error">{error}</p>}

      {sessions.length > 0 && (
        <div className="sessions-table-wrap">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Table</th>
                <th>Commandes</th>
                <th>Articles</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <React.Fragment key={session.sessionId}>
                  <tr>
                    <td>
                      <button
                        className="sessions-id-btn"
                        onClick={() => handleSessionClick(session.sessionId)}
                      >
                        #{session.sessionId}
                      </button>
                    </td>
                    <td>{session.tableNumber}</td>
                    <td>{session.totalOrders}</td>
                    <td>{session.totalItemOrdered}</td>
                    <td>{session.totalAmont?.toFixed(2)} CFA</td>
                  </tr>
                  {expandedSessionId === session.sessionId && (
                    <tr>
                      <td colSpan={5}>
                        <div className="sessions-details">
                          <div className="sessions-details-grid">
                            <div><span>Session</span>#{session.sessionId}</div>
                            <div><span>Table</span>{session.tableNumber}</div>
                            <div><span>Commandes</span>{session.totalOrders}</div>
                            <div><span>Articles</span>{session.totalItemOrdered}</div>
                            <div><span>Total</span>{session.totalAmont?.toFixed(2)} CFA</div>
                          </div>

                          {session.items && session.items.length > 0 && (
                            <div className="sessions-items">
                              <p className="sessions-items-label">Articles commandés</p>
                              <table className="sessions-items-table">
                                <thead>
                                  <tr>
                                    <th>Article</th>
                                    <th>Commande</th>
                                    <th>Quantité</th>
                                    <th>Servi</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {session.items.map(item => (
                                    <tr key={item.itemId}>
                                      <td>{item.itemName}</td>
                                      <td>#{item.orderId}</td>
                                      <td>{item.totalQuantity}</td>
                                      <td className={item.served ? 'sessions-served-yes' : 'sessions-served-no'}>
                                        {item.served ? 'Oui' : 'Non'}
                                      </td>
                                      <td>{item.totalPrice?.toFixed(2)} CFA</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sessions.length === 0 && !loading && !error && (
        <p className="sessions-status">Aucune session trouvée pour cette date.</p>
      )}

      <button className="sessions-back-btn" onClick={() => window.location.href = '/admin'}>
        ← Retour à l'administration
      </button>
    </div>
  );
};

export default SessionSummaryPage;