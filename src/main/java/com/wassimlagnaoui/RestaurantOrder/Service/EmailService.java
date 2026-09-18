
package com.wassimlagnaoui.RestaurantOrder.Service;

import com.wassimlagnaoui.RestaurantOrder.model.Order;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    // URL du frontend déployé
    private static final String FRONTEND_URL =
            "https://byeol-restaurant-1.onrender.com";

    @PostConstruct
    public void checkMailConfig() {
        log.info(
                "GMAIL_USERNAME : {}",
                mailUsername.isBlank() ? "MANQUANT" : "défini"
        );

        log.info(
                "GMAIL_APP_PASSWORD : {}",
                mailPassword.isBlank() ? "MANQUANT" : "défini"
        );
    }

    /**
     * Envoie un email de suivi de commande au client.
     * L'envoi est effectué de manière asynchrone afin
     * de ne pas bloquer les requêtes HTTP.
     *
     * @param order la commande qui vient d'être passée
     */
    @Async
    public void sendOrderTrackingEmail(Order order) {

        try {

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setTo(
                    order.getGuestEmail()
            );

            message.setSubject(
                    "Suivi de votre commande - Byeol"
            );

            message.setText(
                    String.format(
                            "Bonjour,\n\n" +
                            "Votre commande a bien été enregistrée.\n\n" +
                            "Suivez-la en temps réel ici :\n" +
                            "%s/suivi/%s\n\n" +
                            "L'équipe Byeol",
                            FRONTEND_URL,
                            order.getTrackingToken()
                    )
            );

            mailSender.send(message);

            log.info(
                    "Email de suivi envoyé avec succès à {}",
                    order.getGuestEmail()
            );

        } catch (Exception e) {

            log.error(
                    "Erreur lors de l'envoi de l'email de suivi à {} : {}",
                    order.getGuestEmail(),
                    e.getMessage(),
                    e
            );
        }
    }

    /**
     * Envoie un email de confirmation pour une réservation
     * une fois le paiement Stripe validé.
     *
     * L'envoi est asynchrone afin de ne pas bloquer
     * le webhook Stripe.
     *
     * @param clientName nom du client
     * @param email email du client
     * @param dateStr date de la réservation
     * @param timeStr heure de la réservation
     * @param numberOfGuests nombre de convives
     * @param depositAmount montant de l'acompte
     * @param cancellationToken token permettant d'annuler la réservation
     */
    @Async
    public void sendReservationConfirmation(
            String clientName,
            String email,
            String dateStr,
            String timeStr,
            int numberOfGuests,
            java.math.BigDecimal depositAmount,
            String cancellationToken
    ) {

        try {

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setTo(email);

            message.setSubject(
                    "Confirmation de votre réservation - Byeol"
            );

            message.setText(
                    String.format(
                            "Bonjour %s,\n\n" +
                            "Votre réservation est confirmée " +
                            "pour le %s à %s (%d personnes).\n\n" +
                            "Acompte réglé : %.2f FCFA\n\n" +
                            "Besoin d'annuler votre réservation ?\n" +
                            "%s/reservation/annuler/%s\n\n" +
                            "À très bientôt,\n" +
                            "L'équipe Byeol",
                            clientName,
                            dateStr,
                            timeStr,
                            numberOfGuests,
                            depositAmount,
                            FRONTEND_URL,
                            cancellationToken
                    )
            );

            mailSender.send(message);

            log.info(
                    "Email de confirmation de réservation envoyé avec succès à {}",
                    email
            );

        } catch (Exception e) {

            log.error(
                    "Erreur lors de l'envoi de l'email de confirmation à {} : {}",
                    email,
                    e.getMessage(),
                    e
            );
        }
    }
}
