
package com.wassimlagnaoui.RestaurantOrder.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    /**
     * Crée une session Stripe Checkout pour l'acompte
     * de réservation.
     *
     * Montant = 5 000 FCFA × nombre de personnes.
     */
    public String createCheckoutSession(
            Reservation reservation) throws StripeException {

        // =========================================================
        // CONFIGURATION STRIPE
        // =========================================================

        Stripe.apiKey = stripeSecretKey;

        // =========================================================
        // VÉRIFICATION DU COMPTE STRIPE UTILISÉ PAR SPRING
        // =========================================================

        Account account = Account.retrieve();

        System.out.println("==========================================");
        System.out.println("       COMPTE STRIPE UTILISÉ PAR SPRING");
        System.out.println("==========================================");

        System.out.println(
                "Account ID : "
                        + account.getId()
        );

        System.out.println(
                "Email : "
                        + account.getEmail()
        );

        System.out.println("==========================================");

        // =========================================================
        // VÉRIFICATIONS
        // =========================================================

        if (reservation == null) {
            throw new IllegalArgumentException(
                    "La réservation est introuvable."
            );
        }

        if (reservation.getId() == null) {
            throw new IllegalArgumentException(
                    "L'identifiant de la réservation est introuvable."
            );
        }

        if (reservation.getEmail() == null
                || reservation.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "L'adresse email du client est obligatoire."
            );
        }

        if (reservation.getDepositAmount() == null
                || reservation.getDepositAmount().signum() <= 0) {

            throw new IllegalArgumentException(
                    "Le montant de l'acompte doit être supérieur à 0."
            );
        }

        /*
         * Le montant est déjà calculé dans ReservationController.
         *
         * Exemple :
         *
         * 1 personne  = 5 000 XOF
         * 2 personnes = 10 000 XOF
         * 3 personnes = 15 000 XOF
         * 4 personnes = 20 000 XOF
         *
         * XOF est une devise sans décimales.
         * Il ne faut donc PAS multiplier par 100.
         */
        long amountInXof =
                reservation.getDepositAmount().longValue();

        // =========================================================
        // CRÉATION DES PARAMÈTRES STRIPE CHECKOUT
        // =========================================================

        SessionCreateParams params =
                SessionCreateParams.builder()

                        .setMode(
                                SessionCreateParams.Mode.PAYMENT
                        )

                        .setSuccessUrl(
                                successUrl
                                        + "?session_id={CHECKOUT_SESSION_ID}"
                        )

                        .setCancelUrl(cancelUrl)

                        .setCustomerEmail(
                                reservation.getEmail()
                        )

                        // -------------------------------------------------
                        // METADATA
                        // -------------------------------------------------

                        .putMetadata(
                                "reservationId",
                                reservation.getId().toString()
                        )

                        // -------------------------------------------------
                        // ARTICLE / ACOMPTE
                        // -------------------------------------------------

                        .addLineItem(
                                SessionCreateParams.LineItem
                                        .builder()

                                        .setQuantity(1L)

                                        .setPriceData(
                                                SessionCreateParams
                                                        .LineItem
                                                        .PriceData
                                                        .builder()

                                                        .setCurrency("xof")

                                                        .setUnitAmount(
                                                                amountInXof
                                                        )

                                                        .setProductData(
                                                                SessionCreateParams
                                                                        .LineItem
                                                                        .PriceData
                                                                        .ProductData
                                                                        .builder()

                                                                        .setName(
                                                                                "Acompte réservation Byeol"
                                                                        )

                                                                        .setDescription(
                                                                                "Acompte de 5 000 FCFA par personne, déduit de la facture finale le jour de la réservation."
                                                                        )

                                                                        .build()
                                                        )

                                                        .build()
                                        )

                                        .build()
                        )

                        .build();

        // =========================================================
        // VÉRIFICATION DU CONTEXTE STRIPE
        // =========================================================

        System.out.println("==========================================");
        System.out.println("       VERIFICATION CONTEXTE STRIPE");
        System.out.println("==========================================");

        System.out.println(
                "Clé Stripe configurée : "
                        + (stripeSecretKey != null
                        && !stripeSecretKey.isBlank())
        );

        System.out.println(
                "Préfixe clé : "
                        + (stripeSecretKey != null
                        ? stripeSecretKey.substring(
                                0,
                                Math.min(
                                        7,
                                        stripeSecretKey.length()
                                )
                        )
                        : "NULL")
        );

        System.out.println(
                "Reservation ID : "
                        + reservation.getId()
        );

        System.out.println(
                "Email : "
                        + reservation.getEmail()
        );

        System.out.println(
                "Montant : "
                        + amountInXof
                        + " XOF"
        );

        System.out.println(
                "Metadata reservationId : "
                        + reservation.getId()
        );

        System.out.println("==========================================");

        // =========================================================
        // CRÉATION DE LA SESSION STRIPE
        // =========================================================

        Session session =
                Session.create(params);

        // =========================================================
        // INFORMATIONS DE LA SESSION CRÉÉE
        // =========================================================

        System.out.println("==========================================");
        System.out.println("       SESSION STRIPE CRÉÉE");
        System.out.println("==========================================");

        System.out.println(
                "Session ID : "
                        + session.getId()
        );

        System.out.println(
                "Reservation ID metadata : "
                        + session.getMetadata()
                        .get("reservationId")
        );

        System.out.println(
                "Payment status : "
                        + session.getPaymentStatus()
        );

        System.out.println(
                "Email client : "
                        + reservation.getEmail()
        );

        System.out.println(
                "Montant : "
                        + amountInXof
                        + " XOF"
        );

        System.out.println(
                "URL Stripe créée : "
                        + (session.getUrl() != null)
        );

        System.out.println(
                "Session Stripe complète : "
                        + session.getId()
        );

        System.out.println("==========================================");

        return session.getUrl();
    }

    /**
     * Rembourse l'intégralité d'un paiement Stripe.
     */
    public Refund refundPayment(
            String paymentIntentId) throws StripeException {

        // =========================================================
        // CONFIGURATION STRIPE
        // =========================================================

        Stripe.apiKey = stripeSecretKey;

        // =========================================================
        // VÉRIFICATION
        // =========================================================

        if (paymentIntentId == null
                || paymentIntentId.isBlank()) {

            throw new IllegalArgumentException(
                    "PaymentIntent Stripe introuvable."
            );
        }

        // =========================================================
        // CRÉATION DU REMBOURSEMENT
        // =========================================================

        RefundCreateParams params =
                RefundCreateParams.builder()
                        .setPaymentIntent(paymentIntentId)
                        .build();

        return Refund.create(params);
    }
}
