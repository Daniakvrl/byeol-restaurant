
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import FloorPlan from './FloorPlan.jsx';
import { ROUTES, API_BASE } from '../constants';
import './ReservationPage.css';

const ReservationPage = () => {
    const navigate = useNavigate();

    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedTableNumber, setSelectedTableNumber] = useState(null);

    const [form, setForm] = useState({
        clientName: '',
        email: '',
        phone: '',
        reservationDate: '',
        reservationTime: '',
        numberOfGuests: 2,
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /*
     * Acompte fixe par personne
     */
    const DEPOSIT_PER_GUEST = 5000;

    /*
     * Calcul dynamique de l'acompte
     *
     * Exemple :
     * 1 personne = 5 000 FCFA
     * 2 personnes = 10 000 FCFA
     * 3 personnes = 15 000 FCFA
     * 4 personnes = 20 000 FCFA
     */
    const depositAmount =
        DEPOSIT_PER_GUEST * Number(form.numberOfGuests);

    useEffect(() => {

        /*
         * Chargement des tables
         */
        ApiService.getAllTables(null)
            .then((data) => {

                console.log(
                    '[ReservationPage] Tables reçues:',
                    JSON.stringify(data, null, 2)
                );

                setTables(data);
            })
            .catch((err) => {

                console.error(
                    '[ReservationPage] Erreur chargement tables:',
                    err
                );

            });

        /*
         * Chargement des réservations confirmées
         *
         * Les réservations PENDING_PAYMENT ne bloquent
         * donc pas les tables.
         */
        fetch(`${API_BASE}/api/reservations/confirmed`)
            .then((res) =>
                res.ok ? res.json() : []
            )
            .then(setReservations)
            .catch(() =>
                setReservations([])
            );

    }, []);

    /*
     * Modification des champs du formulaire
     */
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    /*
     * Modification du nombre de personnes
     */
    const handleGuestsChange = (delta) => {

        setForm((prev) => ({
            ...prev,

            numberOfGuests: Math.max(
                1,
                Number(prev.numberOfGuests) + delta
            ),
        }));

    };

    /*
     * Création de la réservation
     * puis redirection vers Stripe Checkout.
     */
    const handleSubmit = async (e) => {

        e.preventDefault();

        /*
         * Vérification de la table
         */
        if (!selectedTableNumber) {

            setError(
                'Veuillez sélectionner une table sur le plan.'
            );

            return;
        }

        /*
         * Éviter plusieurs clics
         */
        if (loading) {
            return;
        }

        setLoading(true);
        setError('');

        try {

            /*
             * =========================================
             * ÉTAPE 1 : CRÉATION DE LA RÉSERVATION
             * =========================================
             */

            const reservationResponse =
                await fetch(
                    `${API_BASE}/api/reservations`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',
                        },

                        body: JSON.stringify({

                            clientName:
                                form.clientName,

                            email:
                                form.email,

                            phone:
                                form.phone,

                            reservationDate:
                                form.reservationDate,

                            reservationTime:
                                form.reservationTime,

                            numberOfGuests:
                                Number(
                                    form.numberOfGuests
                                ),

                            tableName:
                                selectedTableNumber,
                        }),
                    }
                );

            /*
             * Vérification de la réponse
             */
            if (!reservationResponse.ok) {

                const message =
                    await reservationResponse.text();

                throw new Error(
                    message ||
                    'Échec de la création de la réservation.'
                );
            }

            /*
             * Récupération de la réservation créée
             */
            const reservation =
                await reservationResponse.json();

            console.log(
                '[ReservationPage] Réservation créée:',
                reservation
            );

            /*
             * Vérification de l'identifiant
             */
            if (!reservation.id) {

                throw new Error(
                    "La réservation a été créée mais son identifiant est introuvable."
                );
            }

            /*
             * Vérification du statut
             *
             * La réservation doit être PENDING_PAYMENT
             * avant d'aller vers Stripe.
             */
            if (
                reservation.status &&
                reservation.status !== 'PENDING_PAYMENT'
            ) {

                console.warn(
                    '[ReservationPage] Statut inattendu:',
                    reservation.status
                );
            }

            /*
             * =========================================
             * ÉTAPE 2 : CRÉATION DU CHECKOUT STRIPE
             * =========================================
             */

            const stripeResponse =
                await fetch(
                    `${API_BASE}/api/stripe/checkout/${reservation.id}`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                    }
                );

            /*
             * Vérification de la réponse Stripe
             */
            if (!stripeResponse.ok) {

                const message =
                    await stripeResponse.text();

                throw new Error(
                    message ||
                    'Impossible de créer le paiement Stripe.'
                );
            }

            /*
             * Le backend retourne l'URL Stripe
             */
            const checkoutUrl =
                await stripeResponse.text();

            console.log(
                '[ReservationPage] URL Stripe:',
                checkoutUrl
            );

            /*
             * Vérification de l'URL
             */
            if (!checkoutUrl) {

                throw new Error(
                    'Stripe n’a pas retourné d’URL de paiement.'
                );
            }

            /*
             * =========================================
             * ÉTAPE 3 : REDIRECTION VERS STRIPE
             * =========================================
             */

            window.location.href =
                checkoutUrl;

        } catch (err) {

            console.error(
                '[ReservationPage] Erreur:',
                err
            );

            setError(
                err.message ||
                "Impossible de traiter la réservation."
            );

            setLoading(false);
        }
    };

    return (
        <div className="reservation-page-wrap">

            {/* =========================================
                PLAN DE SALLE
            ========================================= */}

            <div className="reservation-plan-section">

                <p className="reservation-step">
                    Réservation · Étape 1
                </p>

                <h2 className="reservation-form-title">
                    Choisissez votre table
                </h2>

                <FloorPlan
                    tables={tables}

                    activeTableNumbers={[]}

                    reservations={reservations}

                    selectable

                    selectedTableName={
                        selectedTableNumber
                    }

                    onTableClick={(table) =>
                        setSelectedTableNumber(
                            table.tableName
                        )
                    }
                />

            </div>

            {/* =========================================
                FORMULAIRE
            ========================================= */}

            <div className="reservation-split">

                {/* =====================================
                    IMAGE
                ===================================== */}

                <div className="reservation-image-side">

                    <div className="reservation-image-overlay"></div>

                    <div className="reservation-image-content">

                        <p className="reservation-kicker">
                            Byeol · Lomé
                        </p>

                        <h1 className="reservation-hero-title">
                            Une table
                            <br />
                            vous attend
                        </h1>

                        <p className="reservation-hero-sub">
                            Mar – Sam, 18h – 03h.
                            Réservation recommandée,
                            particulièrement le week-end.
                        </p>

                    </div>

                </div>

                {/* =====================================
                    CONTENU
                ===================================== */}

                <div className="reservation-content-side">

                    <p className="reservation-step">
                        Étape 2
                    </p>

                    <h2 className="reservation-form-title">
                        Vos informations
                    </h2>

                    {/* Table sélectionnée */}

                    {selectedTableNumber && (

                        <p className="reservation-selected-table">

                            Table sélectionnée :{' '}

                            <strong>
                                {selectedTableNumber}
                            </strong>

                        </p>

                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="reservation-form"
                    >

                        {/* =================================
                            INFORMATIONS CLIENT
                        ================================= */}

                        <div className="reservation-grid">

                            {/* Nom */}

                            <div className="reservation-field">

                                <label>
                                    Nom
                                </label>

                                <input
                                    name="clientName"
                                    value={
                                        form.clientName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Votre nom"
                                    required
                                />

                            </div>

                            {/* Téléphone */}

                            <div className="reservation-field">

                                <label>
                                    Téléphone
                                </label>

                                <input
                                    name="phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="+228 ..."
                                    required
                                />

                            </div>

                            {/* Email */}

                            <div className="reservation-field reservation-field-full">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="vous@exemple.com"
                                    required
                                />

                            </div>

                            {/* Date */}

                            <div className="reservation-field">

                                <label>
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="reservationDate"
                                    value={
                                        form.reservationDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* Heure */}

                            <div className="reservation-field">

                                <label>
                                    Heure
                                </label>

                                <input
                                    type="time"
                                    name="reservationTime"
                                    value={
                                        form.reservationTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                        </div>

                        {/* =================================
                            NOMBRE DE PERSONNES
                        ================================= */}

                        <div className="reservation-guests">

                            <label>
                                Nombre de personnes
                            </label>

                            <div className="reservation-guests-control">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleGuestsChange(-1)
                                    }
                                    disabled={loading}
                                >
                                    −
                                </button>

                                <span>
                                    {
                                        form.numberOfGuests
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleGuestsChange(1)
                                    }
                                    disabled={loading}
                                >
                                    +
                                </button>

                            </div>

                            {/* Montant dynamique */}

                            <p className="reservation-deposit">

                                Acompte :{' '}

                                <strong>

                                    {depositAmount.toLocaleString(
                                        'fr-FR'
                                    )}{' '}

                                    FCFA

                                </strong>

                            </p>

                        </div>

                        {/* =================================
                            NOTE IMPORTANTE
                        ================================= */}

                        <div className="reservation-payment-note">

                            <div className="reservation-payment-note-title">

                                ✦ Informations importantes

                            </div>

                            <p>

                                Un acompte de{' '}

                                <strong>
                                    5 000 FCFA par personne
                                </strong>{' '}

                                est demandé lors de la
                                réservation.

                                Cet acompte sera{' '}

                                <strong>
                                    entièrement déduit de
                                    votre addition finale
                                </strong>{' '}

                                le jour de votre venue.

                            </p>

                            <p>

                                Cet acompte permet de
                                garantir votre réservation
                                et de limiter les
                                réservations non honorées
                                (<em>no-show</em>).

                            </p>

                            <p>

                                <strong>
                                    Annulation :
                                </strong>{' '}

                                vous pouvez annuler votre
                                réservation dans les{' '}

                                <strong>
                                    24 heures suivant sa
                                    confirmation
                                </strong>.

                                Dans ce délai, l'acompte
                                sera{' '}

                                <strong>
                                    intégralement remboursé
                                </strong>.

                            </p>

                            <p>

                                Passé ce délai de 24 heures,
                                l'annulation et le
                                remboursement de l'acompte
                                ne seront plus possibles.

                            </p>

                        </div>

                        {/* =================================
                            MESSAGE D'ERREUR
                        ================================= */}

                        {error && (

                            <p className="reservation-error">
                                {error}
                            </p>

                        )}

                        {/* =================================
                            BOUTON PAIEMENT
                        ================================= */}

                        <button
                            type="submit"
                            className="reservation-submit"
                            disabled={loading}
                        >

                            {loading
                                ? 'Préparation du paiement...'
                                : 'Réserver et payer l’acompte'}

                        </button>

                        {/* =================================
                            RETOUR ACCUEIL
                        ================================= */}

                        <button
                            type="button"
                            className="reservation-back-link"
                            onClick={() =>
                                navigate(
                                    ROUTES.LANDING
                                )
                            }
                            disabled={loading}
                        >

                            Retour à l'accueil

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default ReservationPage;
