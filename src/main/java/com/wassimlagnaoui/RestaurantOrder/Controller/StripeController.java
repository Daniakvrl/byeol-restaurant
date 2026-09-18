
package com.wassimlagnaoui.RestaurantOrder.Controller;

import com.stripe.exception.StripeException;
import com.wassimlagnaoui.RestaurantOrder.Repository.ReservationRepository;
import com.wassimlagnaoui.RestaurantOrder.Service.StripeService;
import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;
    private final ReservationRepository reservationRepository;

    /**
     * Création d'une session Stripe Checkout
     * pour une réservation existante.
     */
    @PostMapping("/checkout/{reservationId}")
    public ResponseEntity<?> createCheckout(
            @PathVariable Long reservationId) {

        System.out.println();
        System.out.println("==========================================");
        System.out.println("       STRIPE CHECKOUT - DEBUT");
        System.out.println("==========================================");
        System.out.println(
                "Reservation ID reçu : " + reservationId
        );

        try {

            // Recherche de la réservation
            Reservation reservation =
                    reservationRepository.findById(reservationId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Réservation introuvable"
                                    )
                            );

            System.out.println(
                    "Réservation trouvée : "
                            + reservation.getId()
            );

            System.out.println(
                    "Client : "
                            + reservation.getClientName()
            );

            System.out.println(
                    "Email : "
                            + reservation.getEmail()
            );

            System.out.println(
                    "Statut : "
                            + reservation.getStatus()
            );

            System.out.println(
                    "Nombre de personnes : "
                            + reservation.getNumberOfGuests()
            );

            System.out.println(
                    "Acompte : "
                            + reservation.getDepositAmount()
                            + " FCFA"
            );

            // Vérification du statut
            if (!"PENDING_PAYMENT".equals(
                    reservation.getStatus())) {

                System.err.println(
                        "ERREUR : la réservation n'est pas "
                                + "en attente de paiement."
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Cette réservation n'attend pas de paiement."
                        );
            }

            // Vérification du nombre de personnes
            if (reservation.getNumberOfGuests() <= 0) {

                System.err.println(
                        "ERREUR : nombre de personnes invalide."
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Le nombre de personnes doit être supérieur à zéro."
                        );
            }

            // Vérification de l'acompte
            if (reservation.getDepositAmount() == null) {

                System.err.println(
                        "ERREUR : montant de l'acompte introuvable."
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Le montant de l'acompte est introuvable."
                        );
            }

            System.out.println();
            System.out.println(
                    "Création de la session Stripe..."
            );

            /*
             * Création de la session Stripe Checkout.
             *
             * Le montant est déjà calculé dans Reservation :
             *
             * 5 000 FCFA × nombre de personnes
             *
             * Exemple :
             * 2 personnes = 10 000 FCFA
             */
            String checkoutUrl =
                    stripeService.createCheckoutSession(
                            reservation
                    );

            System.out.println();
            System.out.println(
                    "SESSION STRIPE CRÉÉE AVEC SUCCÈS"
            );

            System.out.println(
                    "URL Stripe : "
                            + checkoutUrl
            );

            System.out.println(
                    "=========================================="
            );
            System.out.println(
                    "       STRIPE CHECKOUT - FIN"
            );
            System.out.println(
                    "=========================================="
            );
            System.out.println();

            // Retourne l'URL Stripe au frontend
            return ResponseEntity.ok(checkoutUrl);

        } catch (StripeException e) {

            System.err.println();
            System.err.println(
                    "=========================================="
            );
            System.err.println(
                    "          ERREUR STRIPE"
            );
            System.err.println(
                    "=========================================="
            );

            System.err.println(
                    "Message : "
                            + e.getMessage()
            );

            System.err.println(
                    "Code Stripe : "
                            + e.getCode()
            );

            System.err.println(
                    "Type : "
                            + e.getClass().getName()
            );

            e.printStackTrace();

            System.err.println(
                    "=========================================="
            );

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Erreur Stripe : "
                                    + e.getMessage()
                    );

        } catch (RuntimeException e) {

            System.err.println();
            System.err.println(
                    "=========================================="
            );
            System.err.println(
                    "       ERREUR RESERVATION"
            );
            System.err.println(
                    "=========================================="
            );

            System.err.println(
                    "Message : "
                            + e.getMessage()
            );

            e.printStackTrace();

            System.err.println(
                    "=========================================="
            );

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }
}
