
import { useEffect, useRef, useState } from 'react';
import {
    FaInstagram,
    FaTiktok,
    FaFacebookF,
    FaWhatsapp,
    FaEnvelope,
    FaPhone,
    FaVolumeUp,
    FaVolumeMute
} from 'react-icons/fa';

import './ContactPage.css';

/* =========================
   DONNÉES STATIQUES
========================= */

const slides = [
    {
        image: '/images/entre.jpg',
        number: '01',
        title: 'L’expérience BYEOL',
        text: 'Bienvenue chez BYEOL, un restaurant pensé pour offrir une expérience élégante, chaleureuse et mémorable.'
    },
    {
        image: '/images/cadre.jpg',
        number: '02',
        title: 'Un cadre élégant',
        text: 'Notre espace mêle raffinement et convivialité afin de créer une atmosphère agréable à chaque visite.'
    },
    {
        image: '/images/cuisine.jpg',
        number: '03',
        title: 'Une cuisine raffinée',
        text: 'Chaque assiette est préparée avec soin, en accordant une attention particulière aux saveurs et à la présentation.'
    },
    {
        image: '/images/moment.jpg',
        number: '04',
        title: 'Des instants à partager',
        text: 'Chez BYEOL, chaque moment est une invitation à découvrir, partager et profiter pleinement de l’instant.'
    }
];

const socialNetworks = [
    {
        name: 'Instagram',
        username: 'Byeol Restaurant',
        icon: <FaInstagram />,
        url: 'https://www.instagram.com/',
        description: 'Suivez notre univers culinaire'
    },
    {
        name: 'TikTok',
        username: 'Byeol Restaurant',
        icon: <FaTiktok />,
        url: 'https://www.tiktok.com/',
        description: 'Découvrez nos actualités'
    },
    {
        name: 'Facebook',
        username: 'Byeol Restaurant',
        icon: <FaFacebookF />,
        url: 'https://www.facebook.com/',
        description: 'Retrouvez-nous sur Facebook'
    }
];

const ContactPage = () => {
    const audioRef = useRef(null);

    const [isMuted, setIsMuted] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showPortal, setShowPortal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [typedText, setTypedText] = useState('');

    /* =========================
       MUSIQUE
    ========================= */

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        audio.volume = 0.15;
        audio.loop = true;

        const startAudio = async () => {
            try {
                await audio.play();
            } catch {
                console.log('Lecture audio bloquée par le navigateur.');
            }

            document.removeEventListener('click', startAudio);
        };

        document.addEventListener('click', startAudio);

        return () => {
            document.removeEventListener('click', startAudio);
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    /* =========================
       UNE IMAGE TOUTES LES 10 S
    ========================= */

    useEffect(() => {
        if (showContact) return;

        const slideTimer = setInterval(() => {
            setCurrentSlide((previous) => {
                if (previous === slides.length - 1) {
                    return previous;
                }

                return previous + 1;
            });
        }, 17000);

        return () => clearInterval(slideTimer);
    }, [showContact]);

    /* =========================
       CONTACT APRÈS 40 S
    ========================= */

    useEffect(() => {
        const contactTimer = setTimeout(() => {
            setShowContact(true);
        }, 69000);

        return () => clearTimeout(contactTimer);
    }, []);

    /* =========================
       PORTAIL DORÉ
    ========================= */

    useEffect(() => {
        if (!showContact) return;

        setShowPortal(true);

        const portalTimer = setTimeout(() => {
            setShowPortal(false);
        }, 2200);

        return () => clearTimeout(portalTimer);
    }, [showContact]);

    /* =========================
       MACHINE À ÉCRIRE
    ========================= */

    useEffect(() => {
        if (showContact) return;

        setTypedText('');

        const text = slides[currentSlide].text;
        let index = 0;

        const typingTimer = setInterval(() => {
            if (index < text.length) {
                setTypedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(typingTimer);
            }
        }, 140);

        return () => clearInterval(typingTimer);
    }, [currentSlide, showContact]);

    /* =========================
       SON
    ========================= */

    const toggleSound = () => {
        const audio = audioRef.current;

        if (!audio) return;

        if (audio.paused) {
            audio.play().catch(() => {});
        }

        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
    };

    return (
        <div className="contact-page">

            <audio
                ref={audioRef}
                src="/audio/byeollll.mp3"
                preload="auto"
            />

            {!showContact ? (

                /* =========================
                   INTRODUCTION
                ========================= */

                <section className="contact-intro-show">

                    <div className="intro-slides">

                        {slides.map((slide, index) => (
                            <div
                                key={slide.image}
                                className={`intro-slide ${
                                    currentSlide === index ? 'active' : ''
                                }`}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                />

                                <div className="intro-slide-overlay"></div>
                            </div>
                        ))}

                    </div>

                    <div className="intro-center">

                        <p className="intro-kicker">
                            BYEOL RESTAURANT
                        </p>

                        <h1>Byeol</h1>

                        <div className="intro-line"></div>

                        <span className="intro-number">
                            {slides[currentSlide].number}
                        </span>

                        <h2>
                            {slides[currentSlide].title}
                        </h2>

                        <p className="intro-description">
                            {typedText}
                            <span className="typing-cursor">|</span>
                        </p>

                    </div>

                    <div className="intro-progress">

                        {slides.map((slide, index) => (
                            <span
                                key={slide.image}
                                className={
                                    currentSlide === index
                                        ? 'active'
                                        : ''
                                }
                            ></span>
                        ))}

                    </div>

                    <button
                        className="sound-button intro-sound-button"
                        onClick={toggleSound}
                        aria-label={
                            isMuted
                                ? 'Activer le son'
                                : 'Couper le son'
                        }
                    >
                        {isMuted ? (
                            <FaVolumeMute />
                        ) : (
                            <FaVolumeUp />
                        )}
                    </button>

                </section>

            ) : (

                /* =========================
                   CONTACT
                ========================= */

                <>

                    {showPortal && (
                        <div className="contact-portal-overlay">

                            <svg
                                className="contact-portal-svg"
                                viewBox="0 0 200 200"
                            >
                                <circle
                                    className="contact-portal-ring contact-portal-ring-outer"
                                    cx="100"
                                    cy="100"
                                    r="92"
                                    pathLength="1"
                                />

                                <circle
                                    className="contact-portal-ring contact-portal-ring-inner"
                                    cx="100"
                                    cy="100"
                                    r="70"
                                    pathLength="1"
                                />
                            </svg>

                        </div>
                    )}

                    <div className="contact-content">

                        <header className="contact-nav">

                            <a
                                href="/"
                                className="contact-logo"
                            >
                                Byeol
                            </a>

                            <div className="contact-nav-right">

                                <button
                                    className="sound-button"
                                    onClick={toggleSound}
                                    aria-label={
                                        isMuted
                                            ? 'Activer le son'
                                            : 'Couper le son'
                                    }
                                >
                                    {isMuted ? (
                                        <FaVolumeMute />
                                    ) : (
                                        <FaVolumeUp />
                                    )}
                                </button>

                                <a
                                    href="/"
                                    className="contact-back"
                                >
                                    ← Retour
                                </a>

                            </div>

                        </header>

                        <main className="contact-main">

                            <section className="contact-hero">

                                <span className="contact-star">
                                    ✦
                                </span>

                                <p className="contact-kicker">
                                    BYEOL RESTAURANT
                                </p>

                                <h1>
                                <h2>
                                    Notre équipe est
                                    <br />
                                    à votre écoute.
                                </h2>
                                </h1>

                                <div className="contact-divider"></div>

                                <p className="contact-intro">
                                    Retrouvez BYEOL sur nos différents
                                    réseaux sociaux ou contactez directement
                                    notre équipe.
                                </p>

                            </section>

                            <section className="contact-section">

                                <div className="contact-section-title">
                                    <span>01</span>
                                    <h2>Nos réseaux</h2>
                                </div>

                                <div className="social-grid">

                                    {socialNetworks.map((network, index) => (

                                        <a
                                            key={network.name}
                                            href={network.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="social-card"
                                            style={{
                                                '--i': index
                                            }}
                                        >

                                            <div className="social-icon">
                                                {network.icon}
                                            </div>

                                            <div className="social-content">

                                                <span className="social-name">
                                                    {network.name}
                                                </span>

                                                <h3>
                                                    {network.username}
                                                </h3>

                                                <p>
                                                    {network.description}
                                                </p>

                                            </div>

                                            <span className="social-arrow">
                                                ↗
                                            </span>

                                        </a>

                                    ))}

                                </div>

                            </section>

                            <section className="contact-section">

                                <div className="contact-section-title">
                                    <span>02</span>
                                    <h2>Nous contacter</h2>
                                </div>

                                <div className="direct-contact-grid">

                                    <a
                                        href="mailto:contact@byeol.com"
                                        className="direct-contact-card"
                                        style={{
                                            '--i': 0
                                        }}
                                    >

                                        <div className="direct-icon">
                                            <FaEnvelope />
                                        </div>

                                        <div>
                                            <span>E-mail</span>

                                            <h3>
                                                contact@byeol.com
                                            </h3>
                                        </div>

                                    </a>

                                    <a
                                        href="tel:+22800000000"
                                        className="direct-contact-card"
                                        style={{
                                            '--i': 1
                                        }}
                                    >

                                        <div className="direct-icon">
                                            <FaPhone />
                                        </div>

                                        <div>
                                            <span>Téléphone</span>

                                            <h3>
                                                +228 72 80 90 90
                                            </h3>
                                        </div>

                                    </a>

                                    <a
                                        href="https://wa.me/22800000000"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="direct-contact-card"
                                        style={{
                                            '--i': 2
                                        }}
                                    >

                                        <div className="direct-icon">
                                            <FaWhatsapp />
                                        </div>

                                        <div>
                                            <span>WhatsApp</span>

                                            <h3>
                                                Byeol Restaurant
                                            </h3>
                                        </div>

                                    </a>

                                </div>

                            </section>

                            <section className="contact-help">

                                <p className="contact-help-kicker">
                                    BESOIN D'ASSISTANCE ?
                                </p>

                                <h2>
                                    Notre équipe est
                                    <br />
                                    à votre écoute.
                                </h2>

                                <p>
                                    Pour toute question concernant une
                                    réservation, une commande ou les services
                                    de BYEOL, n'hésitez pas à nous contacter.
                                </p>

                            </section>

                        </main>

                        <footer className="contact-footer">

                            <span>
                                © 2026 BYEOL RESTAURANT
                            </span>

                            <span>
                                Élégance · Gastronomie · Expérience
                            </span>

                        </footer>

                    </div>

                </>

            )}

        </div>
    );
};

export default ContactPage;
