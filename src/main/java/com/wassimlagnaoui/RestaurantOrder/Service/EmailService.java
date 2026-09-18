package com.wassimlagnaoui.RestaurantOrder.Service;

import com.wassimlagnaoui.RestaurantOrder.model.Order;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    @PostConstruct
    public void checkMailConfig() {
        log.info("GMAIL_USERNAME : {}", mailUsername.isBlank() ? "MANQUANT" : "défini");
        log.info("GMAIL_APP_PASSWORD : {}", mailPassword.isBlank() ? "MANQUANT" : "défini");
    }

    /**
     * Envoie un email de suivi de commande au client (lien public, sans authentification).
     * @param order la commande qui vient d'être passée
     */
    public void sendOrderTrackingEmail(Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(order.getGuestEmail());
        message.setSubject("Suivi de votre commande - Byeol");
        message.setText(String.format(
            "Bonjour,\n\nVotre commande a bien été enregistrée.\n" +
            "Suivez-la en temps réel ici : http://localhost:5173/suivi/%s\n\n" +
            "L'équipe Byeol",
            order.getTrackingToken()
        ));
        mailSender.send(message);
        log.info("Email de suivi envoyé avec succès à {}", order.getGuestEmail());
    }

    /**
     * Envoie un email de confirmation pour une réservation (utilisé une fois le paiement Stripe validé).
     * @param clientName nom du client
     * @param email email du client
     * @param dateStr date de la réservation (formatée en String)
     * @param timeStr heure de la réservation (formatée en String)
     * @param numberOfGuests nombre de convives
     * @param depositAmount montant de l'acompte réglé
     * @param cancellationToken token unique permettant au client d'annuler sa réservation sans se connecter
     */
    public void sendReservationConfirmation(String clientName, String email, String dateStr,
                                             String timeStr, int numberOfGuests, java.math.BigDecimal depositAmount,
                                             String cancellationToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Confirmation de votre réservation - Byeol");
        message.setText(String.format(
            "Bonjour %s,\n\nVotre réservation est confirmée pour le %s à %s (%d personnes).\n" +
            "Acompte réglé : %.2f FCFA\n\n" +
            "Besoin d'annuler votre réservation ?\n" +
            "http://localhost:5173/reservation/annuler/%s\n\n" +
            "À très bientôt,\nL'équipe Byeol",
            clientName, dateStr, timeStr, numberOfGuests, depositAmount, cancellationToken
        ));
        mailSender.send(message);
        log.info("Email de confirmation de réservation envoyé avec succès à {}", email);
    }
}