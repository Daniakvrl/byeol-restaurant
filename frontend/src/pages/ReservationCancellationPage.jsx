
import { useNavigate, useParams } from 'react-router-dom';
import './ReservationCancellationPage.css';

const ReservationCancellationPage = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const handleCancel = () => {
        // Ici, tu gardes ta logique actuelle d'annulation
        console.log('Annulation de la réservation :', token);
    };

    return (
        <div className="byeol-cancel-page">

            {/* Navigation */}
            <header className="byeol-cancel-nav">
                <span className="byeol-cancel-logo">
                    Byeol
                </span>

                <div className="byeol-cancel-nav-links">
                    <button onClick={() => navigate('/')}>
                        Accueil
                    </button>

                    <button onClick={() => navigate('/menu')}>
                        Menu
                    </button>

                    <button onClick={() => navigate('/reservation')}>
                        Réserver
                    </button>
                </div>
            </header>

            {/* Contenu */}
            <main className="byeol-cancel-main">

                <p className="byeol-cancel-kicker">
                    BYEOL · RÉSERVATION
                </p>

                <div className="byeol-cancel-icon">
                    !
                </div>

                <h1 className="byeol-cancel-title">
                    Annuler
                    <br />
                    ma réservation
                </h1>

                <div className="byeol-cancel-divider"></div>

                <p className="byeol-cancel-message">
                    Vous êtes sur le point d'annuler votre réservation
                    au restaurant <strong>Byeol</strong>.
                </p>

                <div className="byeol-cancel-info">
                    <p>
                        L'annulation est possible uniquement dans les
                        <strong> 24 heures suivant la confirmation</strong>
                        de votre réservation.
                    </p>

                    <br />

                    <p>
                        Si l'annulation est effectuée dans ce délai,
                        votre acompte sera automatiquement remboursé.
                    </p>
                </div>

                {/* Actions */}
                <div className="byeol-cancel-actions">

                    <button
                        className="byeol-cancel-btn-outline"
                        onClick={() => navigate('/')}
                    >
                        Retour
                    </button>

                    <button
                        className="byeol-cancel-btn-danger"
                        onClick={handleCancel}
                    >
                        Confirmer l'annulation
                    </button>

                </div>

                <p
                    style={{
                        marginTop: '22px',
                        fontSize: '9px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        color: 'rgba(245,243,239,0.4)'
                    }}
                >
                    Aucune connexion à un compte n'est nécessaire.
                </p>

            </main>

            {/* Footer */}
            <footer className="byeol-cancel-footer">
                <span>Mar – Sam, 19h – 03h</span>
                <span>Lomé · Togo</span>
                <span>© 2026 BYEOL</span>
            </footer>

        </div>
    );
};

export default ReservationCancellationPage;
