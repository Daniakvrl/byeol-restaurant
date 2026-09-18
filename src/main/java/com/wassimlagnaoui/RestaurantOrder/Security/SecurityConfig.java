
package com.wassimlagnaoui.RestaurantOrder.Security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(
                customUserDetailsService
        );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {

        return new ProviderManager(
                daoAuthenticationProvider()
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // Désactivation CSRF pour API REST
                .csrf(csrf -> csrf.disable())

                // Autoriser H2 Console
                .headers(headers ->
                        headers.frameOptions(
                                frame -> frame.disable()
                        )
                )

                // Autoriser CORS
                .cors(Customizer.withDefaults())

                // JWT => pas de session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ==============================
                        // ROUTES PUBLIQUES
                        // ==============================
                        .requestMatchers(
                                "/api/auth/**",

                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",

                                "/",
                                "/index.html",
                                "/login",

                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/static/**",
                                "/favicon.ico",

                                "/h2-console/**",

                                // Webhook Stripe
                                "/api/webhooks/**",

                                // Création du paiement Stripe
                                "/api/stripe/**"
                        ).permitAll()

                        // ==============================
                        // ADMIN
                        // ==============================
                        .requestMatchers(
                                "/api/staff/**"
                        ).hasAuthority("ROLE_ADMIN")

                        .requestMatchers(
                                "/api/menu-items/add"
                        ).hasAuthority("ROLE_ADMIN")

                        .requestMatchers(
                                "/api/stats/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // ==============================
                        // MENU PUBLIC
                        // ==============================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/menu-items",
                                "/api/menu-items/",
                                "/api/menu-items/available",
                                "/api/menu-items/{id}"
                        ).permitAll()

                        // ==============================
                        // RÉSERVATIONS PUBLIQUES
                        // ==============================
                        .requestMatchers(
                                "/api/reservations",
                                "/api/reservations/**"
                        ).permitAll()

                        // ==============================
                        // COMMANDES / SESSIONS
                        // ==============================
                        .requestMatchers(
                                "/orders/**",
                                "/sessions/**"
                        ).permitAll()

                        // ==============================
                        // TOUT LE RESTE PROTÉGÉ
                        // ==============================
                        .anyRequest().authenticated()
                )

                .authenticationProvider(
                        daoAuthenticationProvider()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
