import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../services/ApiService';
import './OrderTrackingPage.css';

const OrderTrackingPage = () => {
    const { token } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await ApiService.trackOrder(token);
                setOrder(data);
            } catch (err) {
                console.error('[OrderTrackingPage] Failed to fetch order:', err);
                setError("Impossible de trouver cette commande.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Rafraîchit le statut toutes les 10 secondes
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [token]);

    if (loading) {
        return (
            <div className="tracking-page">
                <p className="tracking-status">Chargement de votre commande...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tracking-page">
                <p className="tracking-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="tracking-page">
            <p className="tracking-star">✦</p>
            <h1 className="tracking-title">Suivi de votre commande</h1>
            <p className="tracking-order-status">
                Statut : <strong>{order.status}</strong>
            </p>

            <div className="tracking-items">
                {order.orderItems && order.orderItems.map((item) => (
                    <div key={item.itemId} className="tracking-item">
                        <span>{item.quantity}× {item.name}</span>
                        <span className={item.served ? 'served' : 'pending'}>
                            {item.served ? 'Servi ✓' : 'En préparation...'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderTrackingPage;