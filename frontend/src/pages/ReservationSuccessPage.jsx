
import { useNavigate } from 'react-router-dom';
import './ReservationSuccessPage.css';

const ReservationSuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="byeol-success-page">

            {/* Navigation */}
            <header className="byeol-success-nav">
                <span className="byeol-success-logo">
                    Byeol
                </span>

                <div className="byeol-success-nav-links">
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


            {/* Contenu principal */}
            <main className="byeol-success-main">

                <p className="byeol-success-kicker">
                    BYEOL · RÉSERVATION
                </p>

                {/* Cercle de confirmation */}
                <div className="byeol-success-check">
                    ✓
                </div>

                <h1 className="byeol-success-title">
                    Réservation
                    <br />
                    confirmée
                </h1>

                <div className="byeol-success-divider"></div>

                <p className="byeol-success-message">
                    Votre réservation chez BYEOL a bien été enregistrée.
                </p>

                <p className="byeol-success-submessage">
                    Votre paiement a été reçu et votre réservation est
                    maintenant confirmée.
                    <br />
                    Un email de confirmation vous a été envoyé.
                </p>


                {/* Information email */}
                <div className="byeol-success-email">
                    <span className="byeol-success-email-icon">
                        ✉
                    </span>

                    <div>
                        <span className="byeol-success-email-title">
                            Confirmation par email
                        </span>

                        <span className="byeol-success-email-text">
                            Consultez votre boîte de réception pour retrouver
                            les détails de votre réservation.
                        </span>
                    </div>
                </div>


                {/* Actions */}
                <div className="byeol-success-actions">

                    <button
                        className="byeol-success-btn-outline"
                        onClick={() => navigate('/')}
                    >
                        Retour à l'accueil
                    </button>

                    <button
                        className="byeol-success-btn-solid"
                        onClick={() => navigate('/menu')}
                    >
                        Découvrir le menu
                    </button>

                </div>

            </main>


            {/* Footer */}
            <footer className="byeol-success-footer">

                <span>
                    Mar – Sam, 19h – 03h
                </span>

                <span>
                    Lomé · Togo
                </span>

                <span>
                    © 2026 BYEOL
                </span>

            </footer>

        </div>
    );
};

export default ReservationSuccessPage;
