import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { ROUTES } from '../constants';
import { getPostLoginRoute } from '../utils/auth';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { token } = await ApiService.login(email, password);
            login(token);
            navigate(getPostLoginRoute(token, ROUTES));
        } catch (err) {
            console.error(err);
            setError('Identifiants invalides');
        }
    };

    return (
        <div className="login-page">
            <div className="login-image-side">
                <div className="login-arch-frame">
                    <div className="login-arch-frame-inner">
                        <div className="login-arch-photo" />
                    </div>
                </div>
                <p className="login-star">✦</p>
                <p className="login-brandmark">B Y E O L</p>
            </div>

            <div className="login-form-side">
                <button
                    className="login-link login-back-link"
                    onClick={() => navigate(ROUTES.LANDING)}
                >
                    ← Retour à l'accueil
                </button>

                <p className="login-kicker">별 · MAISON DE TABLE</p>
                <h1 className="login-title">Bienvenue</h1>
                <div className="login-divider" />

                <form onSubmit={handleSubmit} className="login-form">
                    <label className="login-label">EMAIL</label>
                    <input
                        type="email"
                        placeholder="vous@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />

                    <label className="login-label">MOT DE PASSE</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />

                    <button type="submit" className="login-button">ENTRER</button>

                    {error && <div className="login-error">{error}</div>}
                </form>

                <button
                    className="login-link"
                    onClick={() => navigate('/register')}
                >
                    Mot de passe oublié ?
                </button>

                <button
                    className="login-link login-register-link"
                    onClick={() => navigate('/register')}
                >
                    Pas encore de compte ? S'inscrire
                </button>
            </div>
        </div>
    );
};

export default LoginPage;