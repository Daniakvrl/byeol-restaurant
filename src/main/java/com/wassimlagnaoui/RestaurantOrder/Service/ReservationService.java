
package com.wassimlagnaoui.RestaurantOrder.Service;

import com.wassimlagnaoui.RestaurantOrder.Repository.ReservationRepository;
import com.wassimlagnaoui.RestaurantOrder.model.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    /**
     * Toutes les réservations confirmées (payées),
     * pour la vue Salle du staff.
     */
    public List<Reservation> getConfirmedReservations() {
        return reservationRepository.findByStatus("CONFIRMED");
    }

    /**
     * Réservations confirmées pour une date précise.
     */
    public List<Reservation> getConfirmedReservationsByDate(
            LocalDate date) {

        return reservationRepository
                .findByReservationDateAndStatus(
                        date,
                        "CONFIRMED"
                );
    }

    /**
     * Toutes les réservations,
     * tous statuts confondus.
     */
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    /**
     * Enregistre ou met à jour une réservation.
     */
    public Reservation save(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    /**
     * Recherche une réservation grâce au token
     * envoyé au client dans son email.
     *
     * Aucun compte client n'est nécessaire.
     */
    public Optional<Reservation> findByCancellationToken(
            String token) {

        return reservationRepository
                .findByCancellationToken(token);
    }

    /**
     * Vérifie si une réservation peut encore être annulée.
     *
     * La règle métier est :
     * l'annulation est possible dans les 24 heures
     * suivant la confirmation de la réservation.
     */
    public boolean canBeCancelled(Reservation reservation) {

        if (reservation == null) {
            return false;
        }

        if (!"CONFIRMED".equals(reservation.getStatus())) {
            return false;
        }

        if (reservation.getConfirmedAt() == null) {
            return false;
        }

        LocalDateTime expiration =
                reservation.getConfirmedAt().plusHours(24);

        return LocalDateTime.now().isBefore(expiration)
                || LocalDateTime.now().isEqual(expiration);
    }
}
