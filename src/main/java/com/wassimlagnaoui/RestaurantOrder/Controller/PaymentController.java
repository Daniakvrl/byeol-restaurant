package com.wassimlagnaoui.RestaurantOrder.Controller;

import com.stripe.exception.StripeException;
import com.wassimlagnaoui.RestaurantOrder.Repository.ReservationRepository;
import com.wassimlagnaoui.RestaurantOrder.Service.StripeService;
import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class PaymentController {

    private final ReservationRepository reservationRepository;
    private final StripeService stripeService;

    @PostMapping("/{id}/checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @PathVariable Long id) throws StripeException {

        System.out.println("==========================================");
        System.out.println("       STRIPE CHECKOUT - DEBUT");
        System.out.println("==========================================");

        System.out.println("Reservation ID reçu : " + id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Réservation introuvable"));

        System.out.println("Réservation trouvée : " + reservation.getId());
        System.out.println("Client : " + reservation.getClientName());
        System.out.println("Email : " + reservation.getEmail());
        System.out.println("Statut : " + reservation.getStatus());
        System.out.println("Nombre de personnes : "
                + reservation.getNumberOfGuests());
        System.out.println("Acompte : "
                + reservation.getDepositAmount() + " FCFA");

        System.out.println();
        System.out.println("Création de la session Stripe...");

        String checkoutUrl =
                stripeService.createCheckoutSession(reservation);

        System.out.println();
        System.out.println("SESSION STRIPE CRÉÉE AVEC SUCCÈS");
        System.out.println("URL Stripe : " + checkoutUrl);

        System.out.println("==========================================");
        System.out.println("       STRIPE CHECKOUT - FIN");
        System.out.println("==========================================");

        Map<String, String> response = new HashMap<>();
        response.put("checkoutUrl", checkoutUrl);

        return ResponseEntity.ok(response);
    }
}