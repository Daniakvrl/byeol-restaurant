
package com.wassimlagnaoui.RestaurantOrder.Repository;

import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatus(String status);

    List<Reservation> findByReservationDate(LocalDate date);

    List<Reservation> findByReservationDateAndStatus(
            LocalDate date,
            String status
    );

    Optional<Reservation> findByStripeSessionId(
            String stripeSessionId
    );

    /**
     * Recherche d'une réservation grâce au token
     * envoyé au client par email.
     */
    Optional<Reservation> findByCancellationToken(
            String cancellationToken
    );
}
