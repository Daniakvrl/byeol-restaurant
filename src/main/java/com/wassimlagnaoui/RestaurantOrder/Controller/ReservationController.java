
package com.wassimlagnaoui.RestaurantOrder.Controller;

import com.stripe.exception.StripeException;
import com.wassimlagnaoui.RestaurantOrder.Repository.RestaurantTableRepository;
import com.wassimlagnaoui.RestaurantOrder.Service.ReservationService;
import com.wassimlagnaoui.RestaurantOrder.Service.StripeService;
import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private static final BigDecimal DEPOSIT_PER_GUEST =
            BigDecimal.valueOf(5000);

    private final ReservationService reservationService;

    private final RestaurantTableRepository
            restaurantTableRepository;

    private final StripeService stripeService;

    /**
     * Création d'une réservation.
     *
     * La réservation est créée avec le statut
     * PENDING_PAYMENT.
     */
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @RequestBody ReservationRequest request) {

        /*
         * Vérification du nombre de personnes.
         */
        if (request.getNumberOfGuests() <= 0) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        /*
         * Calcul de l'acompte :
         *
         * 1 personne  = 5 000 FCFA
         * 2 personnes = 10 000 FCFA
         * 3 personnes = 15 000 FCFA
         */
        BigDecimal deposit =
                DEPOSIT_PER_GUEST.multiply(
                        BigDecimal.valueOf(
                                request.getNumberOfGuests()
                        )
                );

        /*
         * Token unique permettant au client
         * d'annuler sa réservation sans compte.
         */
        String cancellationToken =
                UUID.randomUUID().toString();

        Reservation.ReservationBuilder builder =
                Reservation.builder()
                        .clientName(
                                request.getClientName()
                        )
                        .email(
                                request.getEmail()
                        )
                        .phone(
                                request.getPhone()
                        )
                        .reservationDate(
                                request.getReservationDate()
                        )
                        .reservationTime(
                                request.getReservationTime()
                        )
                        .numberOfGuests(
                                request.getNumberOfGuests()
                        )
                        .depositAmount(deposit)
                        .cancellationToken(
                                cancellationToken
                        )
                        .status("PENDING_PAYMENT");

        /*
         * Association avec la table sélectionnée.
         */
        if (request.getTableName() != null) {

            restaurantTableRepository
                    .findByTableNumber(
                            request.getTableName()
                    )
                    .ifPresent(builder::table);
        }

        Reservation saved =
                reservationService.save(
                        builder.build()
                );

        /*
         * L'email sera envoyé uniquement après
         * la confirmation du paiement Stripe.
         */

        return ResponseEntity.ok(saved);
    }

    /**
     * Réservations confirmées.
     */
    @GetMapping("/confirmed")
    public ResponseEntity<List<Reservation>> getConfirmed() {

        return ResponseEntity.ok(
                reservationService
                        .getConfirmedReservations()
        );
    }

    /**
     * Réservations confirmées pour une date précise.
     */
    @GetMapping("/confirmed/{date}")
    public ResponseEntity<List<Reservation>>
    getConfirmedByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                reservationService
                        .getConfirmedReservationsByDate(date)
        );
    }

    /**
     * Toutes les réservations.
     */
    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {

        return ResponseEntity.ok(
                reservationService
                        .getAllReservations()
        );
    }

    /**
     * Annulation d'une réservation par son token.
     *
     * Le client n'a pas besoin de compte.
     *
     * Conditions :
     *
     * 1. réservation existante ;
     * 2. statut CONFIRMED ;
     * 3. délai de 24 heures non dépassé ;
     * 4. PaymentIntent Stripe disponible ;
     * 5. remboursement Stripe réussi.
     */
    @DeleteMapping("/cancel/{token}")
    public ResponseEntity<?> cancelReservation(
            @PathVariable String token) {

        return reservationService
                .findByCancellationToken(token)
                .map(reservation -> {

                    /*
                     * Vérifier si elle est déjà annulée.
                     */
                    if ("CANCELLED".equals(
                            reservation.getStatus())) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Cette réservation est déjà annulée."
                                );
                    }

                    /*
                     * Seule une réservation confirmée
                     * et payée peut être annulée.
                     */
                    if (!"CONFIRMED".equals(
                            reservation.getStatus())) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Cette réservation ne peut pas être annulée."
                                );
                    }

                    /*
                     * Vérifier le délai de 24 heures.
                     */
                    if (!reservationService
                            .canBeCancelled(reservation)) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Le délai de 24 heures pour annuler cette réservation est dépassé."
                                );
                    }

                    /*
                     * Vérifier que Stripe possède
                     * bien le PaymentIntent.
                     */
                    String paymentIntentId =
                            reservation
                                    .getStripePaymentIntentId();

                    if (paymentIntentId == null
                            || paymentIntentId.isBlank()) {

                        return ResponseEntity
                                .internalServerError()
                                .body(
                                        "Impossible d'identifier le paiement Stripe à rembourser."
                                );
                    }

                    try {

                        /*
                         * =================================================
                         * REMBOURSEMENT STRIPE
                         * =================================================
                         *
                         * On rembourse l'intégralité
                         * de l'acompte payé.
                         */
                        stripeService.refundPayment(
                                paymentIntentId
                        );

                        /*
                         * IMPORTANT :
                         * On ne passe à CANCELLED
                         * qu'après confirmation de Stripe.
                         */
                        reservation.setStatus(
                                "CANCELLED"
                        );

                        reservationService.save(
                                reservation
                        );

                        return ResponseEntity.ok(
                                "Votre réservation a été annulée et votre acompte a été remboursé."
                        );

                    } catch (StripeException e) {

                        /*
                         * Si Stripe refuse le remboursement,
                         * la réservation reste CONFIRMED.
                         */
                        System.err.println(
                                "Erreur remboursement Stripe : "
                                        + e.getMessage()
                        );

                        return ResponseEntity
                                .internalServerError()
                                .body(
                                        "Le remboursement n'a pas pu être effectué. Votre réservation reste confirmée."
                                );
                    }

                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @lombok.Data
    public static class ReservationRequest {

        private String clientName;

        private String email;

        private String phone;

        private LocalDate reservationDate;

        private LocalTime reservationTime;

        private int numberOfGuests;

        private String tableName;
    }
}