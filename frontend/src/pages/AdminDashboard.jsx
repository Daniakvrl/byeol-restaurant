import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import ApiService from '../services/ApiService';
import { resolveImageUrl } from '../utils/menuUtils';
import { ROUTES, API_BASE } from '../constants';

const navLinks = [
  { label: 'Gestion du menu', path: '/admin/menu', color: 'gold' },
  { label: 'Personnel', path: '/admin/staff', color: 'blue' },
  { label: 'Statistiques', path: '/admin/stats', color: 'green' },
  { label: 'Sessions', path: '/admin/sessions', color: 'orange' },
  { label: 'Assistant IA', path: '/admin/ai', color: 'purple' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(null);
  const [activeOrders, setActiveOrders] = useState(null);
  const [reservationsCount, setReservationsCount] = useState(null);
  const [menuCount, setMenuCount] = useState(null);
  const [favouriteItems, setFavouriteItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    ApiService.getTotalRevenueByDate(token)
      .then((data) => {
        const today = new Date().toISOString().slice(0, 10);
        setRevenue(data && data[today] ? data[today] : 0);
      })
      .catch(() => setRevenue(0));

    ApiService.getKitchenQueue(token)
      .then((data) => setActiveOrders(Array.isArray(data) ? data.length : 0))
      .catch(() => setActiveOrders(0));

    fetch(`${API_BASE}/api/reservations/confirmed`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setReservationsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setReservationsCount(0));

    ApiService.getAllMenuItems(token)
      .then((data) => setMenuCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setMenuCount(0));

    ApiService.getMostOrderedItems(token)
      .then((data) => {
        console.log('favouriteItems:', data);
        setFavouriteItems(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => setFavouriteItems([]));
  }, []);

  return (
    <div className={styles['dash-layout']}>
      <div className={styles['dash-sidebar']}>
        <div className={styles['dash-logo']}>
          <span className={styles['dash-logo-star']}>✦</span>
          <span className={styles['dash-logo-text']}>Byeol</span>
        </div>
        <div className={styles['dash-nav']}>
          <div className={`${styles['dash-nav-item']} ${styles['dash-nav-active']}`}>
            <span className={styles['dash-nav-dot']} style={{ background: '#C9A86A' }}></span>
            Tableau de bord
          </div>
          {navLinks.map((link) => (
            <div
              key={link.label}
              className={styles['dash-nav-item']}
              onClick={() => navigate(link.path)}
            >
              <span className={`${styles['dash-nav-dot']} ${styles['dot-' + link.color]}`}></span>
              {link.label}
            </div>
          ))}
        </div>
        <button className={styles['dash-sidebar-back']} onClick={() => navigate(ROUTES.STAFF_HOME)}>
          ← Retour à l'accueil
        </button>
      </div>

      <div className={styles['dash-main']}>
        <div className={styles['dash-topbar']}>
          <p className={styles['dash-kicker']}>Vue d'ensemble</p>
          <h1 className={styles['dash-heading']}>Bonjour, Admin</h1>
        </div>

        <div className={styles['dash-stats-grid']}>
          <div className={`${styles['dash-stat-card']} ${styles['dash-stat-gold']}`}>
            <div>
              <p className={styles['dash-stat-label']}>Menu total</p>
              <p className={styles['dash-stat-value']}>{menuCount !== null ? menuCount : '—'}</p>
            </div>
            <svg width="36" height="36" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="14" fill="none" stroke="rgba(201,168,106,0.2)" strokeWidth="4" />
              <circle cx="17" cy="17" r="14" fill="none" stroke="#f0d090" strokeWidth="4" strokeDasharray="60 100" strokeLinecap="round" transform="rotate(-90 17 17)" />
            </svg>
          </div>

          <div className={`${styles['dash-stat-card']} ${styles['dash-stat-green']}`}>
            <div>
              <p className={styles['dash-stat-label']}>Revenu aujourd'hui</p>
              <p className={styles['dash-stat-value']}>
                {revenue !== null ? `${revenue.toFixed(0)} CFA` : '—'}
              </p>
            </div>
            <svg width="36" height="36" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="14" fill="none" stroke="rgba(123,201,160,0.2)" strokeWidth="4" />
              <circle cx="17" cy="17" r="14" fill="none" stroke="#a8e0c4" strokeWidth="4" strokeDasharray="45 100" strokeLinecap="round" transform="rotate(-90 17 17)" />
            </svg>
          </div>

          <div className={`${styles['dash-stat-card']} ${styles['dash-stat-blue']}`}>
            <div>
              <p className={styles['dash-stat-label']}>Commandes actives</p>
              <p className={styles['dash-stat-value']}>{activeOrders !== null ? activeOrders : '—'}</p>
            </div>
            <svg width="36" height="36" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="14" fill="none" stroke="rgba(107,155,217,0.2)" strokeWidth="4" />
              <circle cx="17" cy="17" r="14" fill="none" stroke="#a9c9ef" strokeWidth="4" strokeDasharray="75 100" strokeLinecap="round" transform="rotate(-90 17 17)" />
            </svg>
          </div>

          <div className={`${styles['dash-stat-card']} ${styles['dash-stat-coral']}`}>
            <div>
              <p className={styles['dash-stat-label']}>Réservations à venir</p>
              <p className={styles['dash-stat-value']}>{reservationsCount !== null ? reservationsCount : '—'}</p>
            </div>
            <svg width="36" height="36" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="14" fill="none" stroke="rgba(217,138,107,0.2)" strokeWidth="4" />
              <circle cx="17" cy="17" r="14" fill="none" stroke="#f0b394" strokeWidth="4" strokeDasharray="85 100" strokeLinecap="round" transform="rotate(-90 17 17)" />
            </svg>
          </div>
        </div>

        <p className={styles['dash-section-label']}>Plats les plus commandés</p>
        <div className={styles['dash-favourites-grid']}>
          {favouriteItems.length === 0 ? (
            <p className={styles['dash-empty']}>Pas encore de données disponibles.</p>
          ) : (
            favouriteItems.map((item, i) => (
              <div className={styles['dash-fav-item']} key={item.name || i}>
                <div className={styles['dash-fav-image-wrap']}>
                  {console.log('image pour', item.name, ':', item.imageUrl, '→', resolveImageUrl(item.imageUrl))}
                  {item.imageUrl && (
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.name}
                      className={styles['dash-fav-image']}
                    />
                  )}
                </div>
                <p className={styles['dash-fav-name']}>{item.name}</p>
                <p className={styles['dash-fav-meta']}>{item.totalQuantity} commandes</p>
              </div>
            ))
          )}
        </div>

        <p className={styles['dash-section-label']}>Accès rapide</p>
        <div className={styles['dash-quick-list']}>
          {[
            { label: 'Gestion du menu', desc: 'Ajouter, modifier ou retirer des plats', path: '/admin/menu', color: 'gold' },
            { label: 'Personnel', desc: 'Gérer les comptes et rôles', path: '/admin/staff', color: 'blue' },
            { label: 'Statistiques', desc: "Voir les ventes et l'activité", path: '/admin/stats', color: 'green' },
            { label: 'Sessions', desc: "Consulter l'historique des tables", path: '/admin/sessions', color: 'orange' },
          ].map((link) => (
            <button
              key={link.label}
              className={styles['dash-quick-item']}
              onClick={() => navigate(link.path)}
            >
              <div className={styles['dash-quick-text']}>
                <span className={styles['dash-quick-title']}>{link.label}</span>
                <span className={styles['dash-quick-desc']}>{link.desc}</span>
              </div>
              <span className={`${styles['dash-quick-enter']} ${styles['enter-' + link.color]}`}>
                ENTRER →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;