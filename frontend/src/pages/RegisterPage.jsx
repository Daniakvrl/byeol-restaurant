import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { ROUTES } from '../constants';
import './RegisterPage.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'ROLE_USER',
        password: '',
        confirmPassword: '',
        employeeId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await ApiService.register({
                email: form.email,
                password: form.password,
                name: form.name,
                role: form.role,
                phone: form.phone,
                confirmPassword: form.confirmPassword,
                employeeId: form.employeeId
            });
            setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setError(err.message || 'Détails d\'inscription invalides');
        }
    };

    return (
        <div className="register-page">
            <div className="register-image-side">
                <div className="register-arch-frame">
                    <div className="register-arch-frame-inner">
                        <div className="register-arch-photo" />
                    </div>
                </div>
                <p className="register-star">✦</p>
                <p className="register-brandmark">B Y E O L</p>
            </div>

            <div className="register-form-side">
                <p className="register-kicker">별 · MAISON DE TABLE</p>
                <h1 className="register-title">Inscription</h1>
                <div className="register-divider" />

                <form onSubmit={handleSubmit} className="register-form" autoComplete="off" spellCheck="false">
                    <label className="register-label">NOM COMPLET</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Votre nom"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <label className="register-label">EMAIL</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="vous@gmail.com"
                        value={form.email}
                        autoComplete="new-email"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <label className="register-label">TÉLÉPHONE</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="90000000"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <label className="register-label">MOT DE PASSE</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        autoComplete="new-password"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <label className="register-label">CONFIRMER LE MOT DE PASSE</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        autoComplete="new-password"
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <label className="register-label">EMPLOYEE ID</label>
                    <input
                        type="text"
                        name="employeeId"
                        placeholder="Identifiant employé"
                        value={form.employeeId}
                        onChange={handleChange}
                        required
                        className="register-input"
                    />

                    <button className="register-button" type="submit">S'INSCRIRE</button>

                    {error && <div className="register-error">{error}</div>}
                    {success && <div className="register-success">{success}</div>}
                </form>

                <button
                    className="register-link"
                    onClick={() => navigate('/login')}
                >
                    Déjà un compte ? Se connecter
                </button>

                <button
                    className="register-link register-back-link"
                    onClick={() => navigate(ROUTES.LANDING)}
                >
                    ← Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;