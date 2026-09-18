import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import ApiService from '../services/ApiService';
import { LOCAL_STORAGE_KEYS, ROUTES, API_BASE } from '../constants';
import { getUserRoleFromToken } from '../utils/auth';

function getUserRole() {
    return getUserRoleFromToken(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
}

function getUserEmail() {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return '';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.email || '';
    } catch {
        return '';
    }
}

const HomePage = () => {
    const navigate = useNavigate();
    const [userRole] = useState(getUserRole());
    const [userEmail] = useState(getUserEmail());
    const [now, setNow] = useState(new Date());

    const [kitchenPending, setKitchenPending] = useState(null);
    const [tablesActive, setTablesActive] = useState(null);
    const [reservationsCount, setReservationsCount] = useState(null);
    const [revenueToday, setRevenueToday] = useState(null);

    const isAdmin = userRole === 'ROLE_ADMIN';

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

        ApiService.getKitchenQueue(token)
            .then(data => setKitchenPending(Array.isArray(data) ? data.length : 0))
            .catch(() => setKitchenPending(0));

        ApiService.getActiveSessions(token)
            .then(data => setTablesActive(Array.isArray(data) ? data.length : 0))
            .catch(() => setTablesActive(0));

        fetch(`${API_BASE}/api/reservations/confirmed`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setReservationsCount(Array.isArray(data) ? data.length : 0))
            .catch(() => setReservationsCount(0));

        if (isAdmin) {
            ApiService.getTotalRevenueByDate(token)
                .then(data => {
                    const today = new Date().toISOString().slice(0, 10);
                    setRevenueToday(data && data[today] ? data[today] : 0);
                })
                .catch(() => setRevenueToday(0));
        }
    }, [isAdmin]);

    const formattedDate = now.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="home-container">
            <div className="home-glow"></div>

            <div className="home-header">
                <div className="home-status">
                    <span className="home-status-dot"></span>
                    <p>Système en ligne</p>
                </div>
                <div className="home-header-row">
                    <h1 className="home-title">Bonjour, équipe</h1>
                    <div className="home-datetime">
                        <p className="home-date">{formattedDate.toUpperCase()}</p>
                        <p className="home-time">{formattedTime}</p>
                    </div>
                </div>
                <div className="home-divider"></div>
            </div>

            <div className="home-grid">
                <div className="home-card home-card-orange" onClick={() => navigate(ROUTES.KITCHEN)}>
                    <div className="home-card-photo home-photo-orange">
                        <span className="home-badge">
                            <span className="home-badge-dot"></span>
                            Actif
                        </span>
                        <span className="home-card-number">01</span>
                    </div>
                    <div className="home-card-body">
                        <p className="home-card-title">Cuisine</p>
                        <p className="home-card-desc">Commandes en cours et préparation des plats</p>
                    </div>
                    <div className="home-card-stats">
                        <div>
                            <p className="home-stat-value">{kitchenPending !== null ? kitchenPending : '—'}</p>
                            <p className="home-stat-label">En attente</p>
                        </div>
                        <div>
                            <p className="home-stat-value home-stat-value-muted">—</p>
                            <p className="home-stat-label">Servis aujourd'hui</p>
                        </div>
                    </div>
                    <div className="home-card-footer">
                        <span>ENTRER</span>
                        <span>→</span>
                    </div>
                </div>

                <div className="home-card home-card-blue" onClick={() => navigate(ROUTES.SERVER)}>
                    <div className="home-card-photo home-photo-blue">
                        <span className="home-badge">
                            <span className="home-badge-dot"></span>
                            {tablesActive !== null ? `${tablesActive} actives` : '...'}
                        </span>
                        <span className="home-card-number">02</span>
                    </div>
                    <div className="home-card-body">
                        <p className="home-card-title">Salle</p>
                        <p className="home-card-desc">Plan de salle, réservations et prise de commande</p>
                    </div>
                    <div className="home-card-stats">
                        <div>
                            <p className="home-stat-value">{tablesActive !== null ? tablesActive : '—'}</p>
                            <p className="home-stat-label">Tables actives</p>
                        </div>
                        <div>
                            <p className="home-stat-value home-stat-value-muted">
                                {reservationsCount !== null ? reservationsCount : '—'}
                            </p>
                            <p className="home-stat-label">Réservations</p>
                        </div>
                    </div>
                    <div className="home-card-footer">
                        <span>ENTRER</span>
                        <span>→</span>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="home-card home-card-gold" onClick={() => navigate(ROUTES.ADMIN)}>
                        <div className="home-card-photo home-photo-gold">
                            <span className="home-badge home-badge-gold">
                                <span className="home-badge-dot"></span>
                                Admin
                            </span>
                            <span className="home-card-number">03</span>
                        </div>
                        <div className="home-card-body">
                            <p className="home-card-title">Administration</p>
                            <p className="home-card-desc">Statistiques, personnel et gestion globale</p>
                        </div>
                        <div className="home-card-stats">
                            <div>
                                <p className="home-stat-value">
                                    {revenueToday !== null ? `${Math.round(revenueToday / 1000)}k` : '—'}
                                </p>
                                <p className="home-stat-label">CFA aujourd'hui</p>
                            </div>
                            <div>
                                <p className="home-stat-value home-stat-value-muted">—</p>
                                <p className="home-stat-label">Vs hier</p>
                            </div>
                        </div>
                        <div className="home-card-footer home-card-footer-gold">
                            <span>ENTRER</span>
                            <span>→</span>
                        </div>
                    </div>
                ) : (
                    <div className="home-card home-card-disabled">
                        <div className="home-card-photo home-photo-disabled">
                            <span className="home-badge home-badge-disabled">
                                <span className="home-badge-dot"></span>
                                Verrouillé
                            </span>
                            <span className="home-card-number">03</span>
                        </div>
                        <div className="home-card-body">
                            <p className="home-card-title">Administration</p>
                            <p className="home-card-desc">Accès réservé aux administrateurs</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="home-footer">
                <p>
                    Connecté en tant que <span>{userEmail || '—'}</span>
                    {' · '}
                    <span
                        className="home-logout"
                        onClick={() => {
                            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
                            navigate(ROUTES.LOGIN);
                        }}
                    >
                        Se déconnecter
                    </span>
                </p>
            </div>
        </div>
    );
};

export default HomePage;