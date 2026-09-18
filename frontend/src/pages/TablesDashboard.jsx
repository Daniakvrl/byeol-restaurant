import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TablesDashboard.css';
import ApiService from '../services/ApiService';
import { ROUTES, API_BASE } from '../constants';
import FloorPlan from './FloorPlan';

const TablesDashboard = () => {
    const [token, setToken] = useState('');
    const [tables, setTables] = useState([]);
    const [activeTableNumbers, setActiveTableNumbers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [reservationsError, setReservationsError] = useState('');

    const navigate = useNavigate();

    const fetchTables = async () => {
        try {
            const data = await ApiService.getAllTables(null);
            setTables(data);
        } catch (err) {
            console.error('Error fetching tables:', err);
        }
    };

    const fetchActiveSessions = async () => {
        try {
            const data = await ApiService.getActiveSessions(null);
            const activeNumbers = data.map(session => session.tableNumber);
            setActiveTableNumbers(activeNumbers);
        } catch (err) {
            console.error('Error fetching active sessions:', err);
        }
    };

    const fetchReservations = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/reservations/confirmed`);
            if (!res.ok) throw new Error('Failed to fetch reservations');
            const data = await res.json();

            const now = new Date();

            const upcoming = data
                .filter((r) => {
                    const dateTime = new Date(`${r.reservationDate}T${r.reservationTime}`);
                    return dateTime >= now;
                })
                .sort((a, b) => {
                    const dateA = new Date(`${a.reservationDate}T${a.reservationTime}`);
                    const dateB = new Date(`${b.reservationDate}T${b.reservationTime}`);
                    return dateA - dateB;
                });

            setReservations(upcoming);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setReservationsError("Impossible de charger les réservations.");
        }
    };

    const startSession = async (tableNumber) => {
        try {
            const newSession = await ApiService.startSession(token, tableNumber);
            localStorage.setItem(`sessionId-${tableNumber}`, newSession.id);
            navigate(ROUTES.ORDER_VIEW, {
                state: { sessionId: newSession.id, tableNumber }
            });
        } catch (err) {
            console.error('Error starting session:', err);
        }
    };

    const handleCardClick = async (tableName, isActive) => {
        if (!isActive) {
            setSelectedTable(tableName);
            setShowModal(true);
        } else {
            try {
                const session = await ApiService.getActiveSessionByTable(token, tableName);
                navigate(ROUTES.ORDER_VIEW, {
                    state: { sessionId: session.id, tableNumber: session.tableNumber }
                });
            } catch (err) {
                console.error('Failed to fetch active session:', err);
            }
        }
    };

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        setToken(authToken);

        fetchTables();
        fetchActiveSessions();
        fetchReservations();
    }, []);

    const handleConfirmStart = () => {
        if (selectedTable) {
            startSession(selectedTable);
        }
        setShowModal(false);
        setSelectedTable(null);
    };

    const handleCancelStart = () => {
        setShowModal(false);
        setSelectedTable(null);
    };

    return (
        <div className="tables-container">
            <h2>Tables disponibles</h2>

            <FloorPlan
                tables={tables}
                activeTableNumbers={activeTableNumbers}
                reservations={reservations}
                onTableClick={(table, status) => {
                    const isActive = status === 'occupied';
                    handleCardClick(table.tableName, isActive);
                }}
            />

            <div className="reservations-section" style={{ marginTop: '48px' }}>
                <h2>Réservations à venir</h2>
                {reservationsError && <p className="error-text">{reservationsError}</p>}
                {reservations.length === 0 ? (
                    <p>Aucune réservation confirmée pour le moment.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Client</th>
                            <th>Table</th>
                            <th>Date</th>
                            <th>Heure</th>
                            <th>Personnes</th>
                            <th>Téléphone</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((r) => (
                            <tr key={r.id}>
                                <td>{r.clientName}</td>
                                <td>{r.table ? r.table.tableNumber : '—'}</td>
                                <td>{r.reservationDate}</td>
                                <td>{r.reservationTime}</td>
                                <td>{r.numberOfGuests}</td>
                                <td>{r.phone}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                    onClick={() => navigate(ROUTES.STAFF_HOME)}
                    className="back-home-btn"
                >
                   Retour à la page d'accueil
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box light-modal">
                        <p>
                            Commencer la session pour le table? <strong>{selectedTable}</strong>?
                        </p>
                        <div className="modal-buttons">
                            <button className="yes-btn" onClick={handleConfirmStart}>Oui</button>
                            <button className="no-btn" onClick={handleCancelStart}>Non</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablesDashboard;