
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { ROUTES } from '../constants';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const [showTableInput, setShowTableInput] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartOrder = async (e) => {
        e.preventDefault();

        if (!tableNumber) {
            setError('Veuillez entrer un numéro de table.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let session;

            try {
                session = await ApiService.getActiveSessionByTable(
                    null,
                    tableNumber
                );
            } catch {
                session = await ApiService.startSession(
                    null,
                    tableNumber
                );
            }

            navigate(ROUTES.MENU, {
                state: {
                    sessionId: session.id || session.sessionId,
                    tableNumber
                }
            });

        } catch (err) {
            console.error(
                '[LandingPage] Failed to start session:',
                err
            );

            setError(
                "Impossible de démarrer la commande. Vérifiez le numéro de table."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editorial-page">

            {/* ================================
                NAVIGATION
               ================================ */}

            <header className="editorial-nav">

                <span className="editorial-logo">
                    Byeol
                </span>

                <div className="editorial-nav-links">

                    <button
                        onClick={() => setShowTableInput(true)}
                    >
                        Menu
                    </button>

                    <button
                        onClick={() =>
                            navigate(ROUTES.RESERVATION)
                        }
                    >
                        Réserver
                    </button>

                    <button
                        onClick={() =>
                            navigate('/contact')
                        }
                    >
                        Nous découvrir
                    </button>

                </div>

            </header>


            {/* ================================
                HERO
               ================================ */}

            <div className="editorial-hero">

                <div className="editorial-overlay"></div>

                <div className="editorial-hero-content">

                    <p className="editorial-kicker">
                        Établi en 2026 · Lomé
                    </p>

                    <h1 className="editorial-title">
                        Byeol
                    </h1>

                    <div className="editorial-divider"></div>

                    <p className="editorial-tagline">
                        Né de la passion pour la gastronomie,
                        BYEOL célèbre l'excellence à travers une
                        cuisine raffinée, des produits d'exception
                        et un savoir-faire minutieux.
                        <br />
                        Dans un cadre élégant et chaleureux,
                        chaque plat est conçu pour éveiller les sens
                        et créer des instants inoubliables.
                    </p>


                    {!showTableInput ? (

                        <div className="editorial-actions">

                            <button
                                className="editorial-btn-outline"
                                onClick={() =>
                                    navigate(
                                        ROUTES.RESERVATION
                                    )
                                }
                            >
                                Réserver
                            </button>

                            <button
                                className="editorial-btn-solid"
                                onClick={() =>
                                    setShowTableInput(true)
                                }
                            >
                                Le menu
                            </button>

                        </div>

                    ) : (

                        <form
                            className="editorial-table-form"
                            onSubmit={handleStartOrder}
                        >

                            <input
                                type="text"
                                value={tableNumber}
                                onChange={(e) =>
                                    setTableNumber(e.target.value)
                                }
                                placeholder="Numéro de table"
                                autoFocus
                            />

                            {error && (
                                <p className="editorial-error">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="editorial-btn-solid"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Chargement...'
                                    : 'Voir le menu'}
                            </button>

                        </form>

                    )}

                </div>

            </div>


            {/* ================================
                FOOTER
               ================================ */}

            <footer className="editorial-footer">

                <span>
                    Mar – Sam, 1h – 03h
                </span>

                <button
                    onClick={() =>
                        navigate(ROUTES.LOGIN)
                    }
                >
                    Espace staff →
                </button>

            </footer>

        </div>
    );
};

export default LandingPage;
