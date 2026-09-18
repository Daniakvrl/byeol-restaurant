import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenDashboard.css';
import ApiService from '../services/ApiService';
import { ROUTES } from '../constants';

const KitchenDashboard = () => {
    const [token, setToken] = useState('');
    const [queue, setQueue] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const FetchQueue = async () => {
        setLoading(true);
        setError('');
        try {
            const authToken = localStorage.getItem('authToken');
            setToken(authToken);
            const queueData = await ApiService.getKitchenQueue(authToken);
            setQueue(queueData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsServed = async (orderItemID) => {
        try {
            await ApiService.markOrderItemAsServed(orderItemID, token);
            FetchQueue();
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        FetchQueue();
    }, []);

    return (
        <div className="kitchen-container">
            <p className="kitchen-kicker">Cuisine · File active</p>
            <h1 className="kitchen-title">Commandes en cours</h1>

            {error && <p className="kitchen-error">{error}</p>}

            {loading ? (
                <p className="kitchen-status">Chargement de la file de commandes...</p>
            ) : queue.length === 0 ? (
                <p className="kitchen-status">Aucune commande en attente.</p>
            ) : (
                <div className="kitchen-table">
                    <div className="kitchen-row kitchen-header-row">
                        <span>Cmd</span>
                        <span>Article</span>
                        <span>Table</span>
                        <span>Plat</span>
                        <span>Qté</span>
                        <span>Statut</span>
                        <span></span>
                    </div>

                    {queue.map((item, index) => (
                        <div className="kitchen-row" key={index}>
                            <span className="kitchen-cell-muted">{item.orderId}</span>
                            <span className="kitchen-cell-muted">{item.orderItemId}</span>
                            <span className="kitchen-cell-table">{item.tableNumber}</span>
                            <span className="kitchen-cell-item">{item.itemName}</span>
                            <span className="kitchen-cell-item">{item.quantity}</span>
                            <span className={item.served ? 'kitchen-status-served' : 'kitchen-status-pending'}>
                                {item.served ? 'Servi' : 'En attente'}
                            </span>
                            {!item.served ? (
                                <button
                                    className="kitchen-serve-btn"
                                    onClick={() => markAsServed(item.orderItemId)}
                                >
                                    Marquer servi
                                </button>
                            ) : (
                                <span className="kitchen-done-label">✓ terminé</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="kitchen-back-wrap">
                <button
                    onClick={() => navigate(ROUTES.STAFF_HOME)}
                    className="kitchen-back-btn"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default KitchenDashboard;