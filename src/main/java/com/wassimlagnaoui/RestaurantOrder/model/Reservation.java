
package com.wassimlagnaoui.RestaurantOrder.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    @Column(name = "number_of_guests", nullable = false)
    private int numberOfGuests;

    @ManyToOne
    @JoinColumn(name = "table_id")
    private RestaurantTable table;

    /**
     * Montant de l'acompte payé.
     * 5 000 FCFA par personne.
     */
    @Column(name = "deposit_amount")
    private BigDecimal depositAmount;

    /**
     * Identifiant de la session Stripe Checkout.
     */
    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    /**
     * Identifiant du PaymentIntent Stripe.
     * Nécessaire pour effectuer un remboursement.
     */
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    /**
     * Token unique permettant au client
     * d'accéder à sa réservation sans compte.
     */
    @Column(name = "cancellation_token", unique = true, nullable = false)
    private String cancellationToken;

    /**
     * Date et heure de création de la réservation.
     */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Date et heure auxquelles le paiement
     * et la réservation ont été confirmés.
     */
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Builder.Default
    private String status = "PENDING_PAYMENT";
}