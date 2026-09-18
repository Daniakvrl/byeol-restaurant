import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MenuView.css';
import ApiService from '../services/ApiService';
import { resolveImageUrl, formatPrice } from '../utils/menuUtils';
import { ROUTES } from '../constants';

const MenuView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId, tableNumber } = location.state || {};

    const [token, setToken] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            try {
                const authToken = localStorage.getItem('authToken');
                setToken(authToken);

                const menu = await ApiService.getAvailableMenuItems(authToken);
                setMenuItems(Array.isArray(menu) ? menu : []);
            } catch (err) {
                console.error('[MenuView] Failed to load menu:', err);
                setError(err.message || 'Failed to load menu');
                setMenuItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleIncrease = (itemId) => {
        setQuantities(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const handleDecrease = (itemId) => {
        setQuantities(prev => {
            const current = prev[itemId] || 0;
            if (current <= 0) return prev;
            return { ...prev, [itemId]: current - 1 };
        });
    };

    const openEmailModal = () => {
        const hasSelection = Object.values(quantities).some(qty => qty > 0);
        if (!hasSelection) {
            alert('Veuillez sélectionner au moins un plat.');
            return;
        }
        setShowEmailModal(true);
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        const selectedItemsPayload = Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({
                menuItemId: parseInt(id),
                quantity: parseInt(qty)
            }));

        setSubmitting(true);
        try {
            await ApiService.placeOrder(token, sessionId, selectedItemsPayload, email);
            setOrderConfirmed(true);
            setShowEmailModal(false);
        } catch (err) {
            console.error('[MenuView] Order failed:', err);
            alert("Impossible d'envoyer la commande. Réessayez.");
        }
        setSubmitting(false);
    };

    const groupedItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Autres';
        acc[category] = acc[category] || [];
        acc[category].push(item);
        return acc;
    }, {});

    const selectedItems = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
            const item = menuItems.find(m => m.id === parseInt(id));
            if (!item) return null;
            return {
                menuItemId: item.id,
                name: item.name,
                quantity: qty,
                total: item.price * qty
            };
        })
        .filter(Boolean);

    const totalPrice = selectedItems.reduce((sum, item) => sum + item.total, 0);

    if (orderConfirmed) {
        return (
            <div className="menu-confirmation-screen">
                <p className="menu-confirmation-seal">✦</p>
                <h2 className="menu-confirmation-title">Commande envoyée</h2>
                <p className="menu-confirmation-text">
                    Un email de suivi a été envoyé à <strong>{email}</strong>.
                </p>
                <p className="menu-confirmation-instruction">
                    Vous pouvez remettre la tablette au serveur.
                </p>
                <button className="menu-confirmation-back" onClick={() => navigate(ROUTES.LANDING)}>
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className="menu-container">
            <div className="menu-items">
                <p className="menu-table-label">Table {tableNumber || '—'}</p>

                {loading && (
                    <p className="menu-status-message">Chargement du menu...</p>
                )}

                {!loading && error && (
                    <p className="menu-error-message">{error}</p>
                )}

                {!loading && !error && menuItems.length === 0 && (
                    <p className="menu-status-message">Aucun plat disponible pour le moment.</p>
                )}

                {!loading && !error && Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="menu-category">
                        <h2 className="menu-category-title">{category}</h2>
                        <div className="menu-grid">
                            {items.map(item => (
                                <div key={item.id} className="menu-item-card">
                                    <div className="menu-item-image-wrap">
                                        {item.imageUrl && (
                                            <img
                                                src={resolveImageUrl(item.imageUrl)}
                                                alt={item.name}
                                                className="menu-item-image"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="menu-item-name">{item.name}</div>
                                    {item.description && (
                                        <div className="menu-item-description">{item.description}</div>
                                    )}
                                    <div className="menu-item-footer">
                                        <span className="menu-item-price">{formatPrice(item.price)} CFA</span>
                                        <div className="quantity-control">
                                            <button className="quantity-btn" onClick={() => handleDecrease(item.id)}>−</button>
                                            <div className="quantity-display">{quantities[item.id] || 0}</div>
                                            <button className="quantity-btn" onClick={() => handleIncrease(item.id)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="menu-cart">
                <p className="menu-cart-title">Votre sélection</p>
                <div className="menu-cart-divider"></div>

                <div className="menu-cart-items">
                    {selectedItems.length === 0 ? (
                        <p className="empty-cart-text">Aucun article sélectionné</p>
                    ) : (
                        selectedItems.map(item => (
                            <div key={item.menuItemId} className="cart-item">
                                <span>{item.quantity}× {item.name}</span>
                                <span>{formatPrice(item.total)} CFA</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="menu-cart-footer">
                    <div className="cart-total">
                        <span>Total</span>
                        <span className="cart-total-amount">{formatPrice(totalPrice)} CFA</span>
                    </div>

                    {selectedItems.length > 0 && (
                        <button className="place-order-btn" onClick={openEmailModal}>
                            Commander
                        </button>
                    )}
                </div>
            </div>

            {showEmailModal && (
                <div className="menu-email-modal-overlay">
                    <div className="menu-email-modal-box">
                        <p className="menu-email-modal-title">Votre email</p>
                        <p className="menu-email-modal-subtitle">
                            Pour suivre votre commande en temps réel
                        </p>

                        <form onSubmit={handleConfirmOrder}>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="vous@email.fr"
                                required
                                className="menu-email-input"
                                autoFocus
                            />

                            <div className="menu-email-modal-buttons">
                                <button type="button" onClick={() => setShowEmailModal(false)}>Annuler</button>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? 'Envoi...' : 'Confirmer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuView;