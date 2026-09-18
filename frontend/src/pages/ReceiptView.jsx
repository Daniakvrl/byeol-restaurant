
// src/pages/ReceiptPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReceiptPage.css';
import ApiService from '../services/ApiService';

const ReceiptPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { sessionId, tableNumber } = location.state || {};

    const [token, setToken] = useState('');
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');

    // Nom de l'utilisateur connecté
    const [userName, setUserName] = useState('Utilisateur');

    // Heure de fin de session
    const [endTime] = useState(new Date());

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        setToken(authToken);

        /*
         * Récupération du nom de l'utilisateur connecté.
         * On vérifie plusieurs noms de clés possibles
         * pour s'adapter à ton système actuel.
         */
        const storedUser =
            localStorage.getItem('user') ||
            localStorage.getItem('currentUser') ||
            localStorage.getItem('username') ||
            localStorage.getItem('userName');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                setUserName(
                    parsedUser.name ||
                    parsedUser.username ||
                    parsedUser.fullName ||
                    parsedUser.nom ||
                    'Utilisateur'
                );
            } catch {
                setUserName(storedUser);
            }
        }
    }, []);

    const fetchSummary = async () => {
        try {
            const authToken = localStorage.getItem('authToken');

            setToken(authToken);

            const data = await ApiService.getCheckoutSummary(
                authToken,
                sessionId
            );

            setSummary(data);

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const confirmEndSession = async () => {
        try {
            await ApiService.endSession(token, tableNumber);

            navigate('/server');

        } catch (err) {
            console.error(err);
            setError("Impossible de terminer la session.");
        }
    };

    const handlePrintAndGoBack = async () => {

        // Impression
        window.print();

        // Fin de session
        await confirmEndSession();
    };

    useEffect(() => {
        if (sessionId) {
            fetchSummary();
        }
    }, [sessionId]);

    // Format de la date
    const formattedDate = endTime.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Format de l'heure
    const formattedTime = endTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (error) {
        return (
            <div className="receipt-container">
                <p className="receipt-error">
                    {error}
                </p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="receipt-container">
                <p className="receipt-loading">
                    Chargement...
                </p>
            </div>
        );
    }

    return (
        <div className="receipt-container">

            {/* ================================
                EN-TÊTE BYEOL
            ================================= */}

            <header className="receipt-header">

                <div className="receipt-brand">
                    BYEOL
                </div>

                <div className="receipt-subtitle">
                    RESTAURANT · LOMÉ
                </div>

                <div className="receipt-line"></div>

                <div className="receipt-document">
                    ADDITION · FIN DE SESSION
                </div>

            </header>


            {/* ================================
                INFORMATIONS SESSION
            ================================= */}

            <section className="receipt-client">

                <div className="receipt-info">
                    <span className="receipt-label">
                        Serveur
                    </span>

                    <span className="receipt-value">
                        {userName}
                    </span>
                </div>


                <div className="receipt-info">
                    <span className="receipt-label">
                        Table
                    </span>

                    <span className="receipt-value">
                        {summary.tableNumber || tableNumber}
                    </span>
                </div>


                <div className="receipt-info">
                    <span className="receipt-label">
                        Date
                    </span>

                    <span className="receipt-value">
                        {formattedDate}
                    </span>
                </div>


                <div className="receipt-info">
                    <span className="receipt-label">
                        Heure de clôture
                    </span>

                    <span className="receipt-value">
                        {formattedTime}
                    </span>
                </div>

            </section>


            {/* ================================
                RÉSUMÉ
            ================================= */}

            <section className="receipt-summary">

                <div>
                    <span>Commandes</span>
                    <strong>{summary.totalOrders}</strong>
                </div>

                <div>
                    <span>Articles</span>
                    <strong>{summary.totalItemOrdered}</strong>
                </div>

            </section>


            {/* ================================
                PLATS
            ================================= */}

            <section>

                <div className="receipt-section-title">
                    Détail de l'addition
                </div>

                <div className="receipt-table-head">
                    <span>ARTICLE</span>
                    <span>QTÉ</span>
                    <span>MONTANT</span>
                </div>

                <ul className="receipt-items">

                    {summary.items.map(item => (

                        <li
                            key={item.itemId}
                            className="receipt-item"
                        >

                            <span>
                                {item.itemName}
                            </span>

                            <span>
                                {item.totalQuantity}
                            </span>

                            <span>
                                {item.totalPrice.toFixed(2)} CFA
                            </span>

                        </li>

                    ))}

                </ul>

            </section>


            {/* ================================
                TOTAL
            ================================= */}

            <div className="receipt-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    {summary.totalAmont.toFixed(2)} CFA
                </strong>

            </div>


            {/* ================================
                MESSAGE BYEOL
            ================================= */}

            <div className="receipt-thankyou">

                <div className="receipt-gold-line"></div>

                <p>
                    Merci pour votre visite
                </p>

                <span>
                    L'expérience BYEOL
                </span>

            </div>


            {/* ================================
                ACTION
            ================================= */}

            <button
                className="receipt-print-btn"
                onClick={handlePrintAndGoBack}
            >
                Imprimer & terminer la session
            </button>


            {/* ================================
                FOOTER
            ================================= */}

            <footer className="receipt-footer">

                <span className="receipt-footer-logo">
                    BYEOL
                </span>

                <span>
                    RESTAURANT · LOMÉ · TOGO
                </span>

                <span>
                    Mar – Sam · 19h – 03h
                </span>

            </footer>

        </div>
    );
};

export default ReceiptPage;
