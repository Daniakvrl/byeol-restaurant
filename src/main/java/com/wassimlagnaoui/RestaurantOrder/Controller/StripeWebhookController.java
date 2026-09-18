
package com.wassimlagnaoui.RestaurantOrder.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.wassimlagnaoui.RestaurantOrder.Repository.ReservationRepository;
import com.wassimlagnaoui.RestaurantOrder.Service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(
                    value = "Stripe-Signature",
                    required = false
            ) String sigHeader) {

        System.out.println("========================================");
        System.out.println("WEBHOOK STRIPE - REÇU");
        System.out.println("========================================");

        // =====================================================
        // 1. Vérification de la signature et du payload
        // =====================================================

        System.out.println(
                "Signature présente : "
                        + (sigHeader != null && !sigHeader.isBlank())
        );

        System.out.println(
                "Payload reçu : "
                        + (payload != null && !payload.isBlank())
        );

        if (sigHeader == null || sigHeader.isBlank()) {

            System.out.println(
                    "ERREUR : Stripe-Signature absente"
            );

            return ResponseEntity
                    .badRequest()
                    .body("Signature absente");
        }

        if (payload == null || payload.isBlank()) {

            System.out.println(
                    "ERREUR : Payload vide"
            );

            return ResponseEntity
                    .badRequest()
                    .body("Payload vide");
        }

        // =====================================================
        // 2. Vérification du secret webhook
        // =====================================================

        System.out.println("========================================");
        System.out.println("VERIFICATION SECRET WEBHOOK");
        System.out.println("========================================");

        System.out.println(
                "Secret présent : "
                        + (webhookSecret != null
                        && !webhookSecret.isBlank())
        );

        System.out.println(
                "Longueur secret : "
                        + (webhookSecret != null
                        ? webhookSecret.length()
                        : 0)
        );

        System.out.println(
                "Commence par whsec_ : "
                        + (webhookSecret != null
                        && webhookSecret.startsWith("whsec_"))
        );

        // =====================================================
        // 3. SHA-256 du secret
        // =====================================================
        // On n'affiche jamais le secret lui-même.
        // Ce hash permet de comparer le secret Spring
        // avec celui chargé dans PowerShell.
        // =====================================================

        if (webhookSecret != null) {

            try {

                MessageDigest digest =
                        MessageDigest.getInstance("SHA-256");

                byte[] hashBytes =
                        digest.digest(
                                webhookSecret.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );

                StringBuilder hashString =
                        new StringBuilder();

                for (byte b : hashBytes) {

                    hashString.append(
                            String.format("%02x", b)
                    );
                }

                System.out.println(
                        "SHA-256 secret Spring : "
                                + hashString
                );

            } catch (Exception e) {

                System.out.println(
                        "ERREUR calcul SHA-256 secret"
                );

                e.printStackTrace();
            }
        }

        System.out.println("========================================");

        // =====================================================
        // 4. Vérification cryptographique de la signature
        // =====================================================

        Event event;

        try {

            event = Webhook.constructEvent(
                    payload,
                    sigHeader,
                    webhookSecret
            );

            System.out.println("========================================");
            System.out.println("SIGNATURE STRIPE VALIDE");
            System.out.println("========================================");

        } catch (SignatureVerificationException e) {

            System.out.println("========================================");
            System.out.println("ERREUR SIGNATURE STRIPE");
            System.out.println(
                    "Message : "
                            + e.getMessage()
            );
            System.out.println("========================================");

            return ResponseEntity
                    .badRequest()
                    .body("Signature invalide");

        } catch (Exception e) {

            System.out.println("========================================");
            System.out.println("ERREUR VERIFICATION WEBHOOK");
            System.out.println(
                    "Message : "
                            + e.getMessage()
            );
            System.out.println("========================================");

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Erreur vérification webhook");
        }

        // =====================================================
        // 5. Informations sur l'événement Stripe
        // =====================================================

        System.out.println(
                "Événement Stripe reçu : "
                        + event.getType()
        );

        System.out.println(
                "ID événement : "
                        + event.getId()
        );

        // =====================================================
        // 6. Traiter uniquement checkout.session.completed
        // =====================================================

        if (!"checkout.session.completed".equals(
                event.getType())) {

            System.out.println(
                    "Événement ignoré : "
                            + event.getType()
            );

            System.out.println(
                    "========================================"
            );

            return ResponseEntity
                    .ok("success");
        }

        System.out.println("========================================");
        System.out.println("CHECKOUT SESSION COMPLETED");
        System.out.println("========================================");

        try {

            // =================================================
            // 7. Lire le JSON reçu de Stripe
            // =================================================

            JsonNode root =
                    objectMapper.readTree(payload);

            JsonNode objectNode =
                    root
                            .path("data")
                            .path("object");

            if (objectNode.isMissingNode()
                    || objectNode.isEmpty()) {

                System.out.println(
                        "ERREUR : objet Checkout Session absent du payload."
                );

                return ResponseEntity
                        .ok("success");
            }

            // =================================================
            // 8. Récupérer l'ID de la Checkout Session
            // =================================================

            String sessionId =
                    objectNode
                            .path("id")
                            .asText(null);

            if (sessionId == null
                    || sessionId.isBlank()) {

                System.out.println(
                        "ERREUR : ID Checkout Session absent."
                );

                return ResponseEntity
                        .ok("success");
            }

            System.out.println(
                    "ID Checkout Session : "
                            + sessionId
            );

            // =================================================
            // 9. Initialiser Stripe
            // =================================================

            Stripe.apiKey =
                    stripeSecretKey;

            // =================================================
            // 10. Récupérer la vraie Checkout Session
            // =================================================

            Session session =
                    Session.retrieve(sessionId);

            System.out.println(
                    "Session Stripe récupérée avec succès."
            );

            System.out.println(
                    "Session ID : "
                            + session.getId()
            );

            // =================================================
            // 11. Vérifier le statut du paiement
            // =================================================

            String paymentStatus =
                    session.getPaymentStatus();

            System.out.println(
                    "Payment status : "
                            + paymentStatus
            );

            if (!"paid".equals(paymentStatus)) {

                System.out.println(
                        "PAIEMENT NON CONFIRMÉ."
                );

                System.out.println(
                        "La réservation ne sera pas confirmée."
                );

                return ResponseEntity
                        .ok("success");
            }

            System.out.println(
                    "PAIEMENT STRIPE CONFIRMÉ : PAID"
            );

            // =================================================
            // 12. Récupérer reservationId depuis metadata
            // =================================================

            String reservationId = null;

            if (session.getMetadata() != null) {

                reservationId =
                        session
                                .getMetadata()
                                .get("reservationId");
            }

            System.out.println(
                    "reservationId : "
                            + reservationId
            );

            if (reservationId == null
                    || reservationId.isBlank()) {

                System.out.println(
                        "ERREUR : reservationId absent des metadata Stripe."
                );

                return ResponseEntity
                        .ok("success");
            }

            // =================================================
            // 13. Convertir reservationId en Long
            // =================================================

            Long id;

            try {

                id =
                        Long.valueOf(
                                reservationId
                        );

            } catch (NumberFormatException e) {

                System.out.println(
                        "ERREUR : reservationId invalide : "
                                + reservationId
                );

                return ResponseEntity
                        .ok("success");
            }

            // =================================================
            // 14. Rechercher la réservation
            // =================================================

            final Long reservationIdFinal =
                    id;

            reservationRepository
                    .findById(id)
                    .ifPresentOrElse(

                            reservation -> {

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
                                        "Statut actuel : "
                                                + reservation.getStatus()
                                );

                                System.out.println(
                                        "Nombre de personnes : "
                                                + reservation
                                                .getNumberOfGuests()
                                );

                                System.out.println(
                                        "Acompte : "
                                                + reservation
                                                .getDepositAmount()
                                );

                                // =============================================
                                // 15. Éviter une double confirmation
                                // =============================================

                                if ("CONFIRMED".equals(
                                        reservation.getStatus())) {

                                    System.out.println(
                                            "Réservation déjà confirmée."
                                    );

                                    return;
                                }

                                // =============================================
                                // 16. Enregistrer les informations Stripe
                                // =============================================

                                reservation.setStripeSessionId(
                                        session.getId()
                                );

                                if (session.getPaymentIntent() != null) {

                                    reservation
                                            .setStripePaymentIntentId(
                                                    session.getPaymentIntent()
                                            );
                                }

                                // =============================================
                                // 17. Confirmer la réservation
                                // =============================================

                                reservation.setConfirmedAt(
                                        LocalDateTime.now()
                                );

                                reservation.setStatus(
                                        "CONFIRMED"
                                );

                                reservationRepository.save(
                                        reservation
                                );

                                System.out.println(
                                        "========================================"
                                );

                                System.out.println(
                                        "RÉSERVATION CONFIRMÉE AVEC SUCCÈS !"
                                );

                                System.out.println(
                                        "ID réservation : "
                                                + reservation.getId()
                                );

                                System.out.println(
                                        "Statut : "
                                                + reservation.getStatus()
                                );

                                System.out.println(
                                        "========================================"
                                );

                                // =============================================
                                // 18. Envoyer l'email de confirmation
                                // =============================================

                                try {

                                    emailService
                                            .sendReservationConfirmation(

                                                    reservation
                                                            .getClientName(),

                                                    reservation
                                                            .getEmail(),

                                                    reservation
                                                            .getReservationDate()
                                                            .toString(),

                                                    reservation
                                                            .getReservationTime()
                                                            .toString(),

                                                    reservation
                                                            .getNumberOfGuests(),

                                                    reservation
                                                            .getDepositAmount(),

                                                    reservation
                                                            .getCancellationToken()
                                            );

                                    System.out.println(
                                            "EMAIL DE CONFIRMATION ENVOYÉ AVEC SUCCÈS."
                                    );

                                } catch (Exception e) {

                                    System.out.println(
                                            "ERREUR ENVOI EMAIL : "
                                                    + e.getMessage()
                                    );

                                    e.printStackTrace();
                                }
                            },

                            () -> {

                                System.out.println(
                                        "ERREUR : réservation introuvable : "
                                                + reservationIdFinal
                                );
                            }
                    );

        } catch (StripeException e) {

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "ERREUR STRIPE"
            );

            System.out.println(
                    "Message : "
                            + e.getMessage()
            );

            System.out.println(
                    "========================================"
            );

            e.printStackTrace();

        } catch (Exception e) {

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "ERREUR WEBHOOK"
            );

            System.out.println(
                    "Message : "
                            + e.getMessage()
            );

            System.out.println(
                    "========================================"
            );

            e.printStackTrace();
        }

        System.out.println(
                "FIN CHECKOUT SESSION COMPLETED"
        );

        System.out.println(
                "========================================"
        );

        return ResponseEntity
                .ok("success");
    }
}
