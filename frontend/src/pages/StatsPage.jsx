import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import ApiService from '../services/ApiService';
import './StatsPage.css';

const StatsPage = () => {
    const [revenueByDate, setRevenueByDate] = useState({});
    const [revenueByMenuItem, setRevenueByMenuItem] = useState({});
    const [mostOrderedItems, setMostOrderedItems] = useState([]);
    const [averageRevenueByDate, setAverageRevenueByDate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setLoading(true);
        Promise.all([
            ApiService.getTotalRevenueByDate(token),
            ApiService.getTotalRevenueByMenuItem(token),
            ApiService.getMostOrderedItems(token),
            ApiService.getAverageSessionRevenueByDate(token)
        ])
            .then(([revDate, revMenu, mostOrdered, avgRev]) => {
                setRevenueByDate(revDate);
                setRevenueByMenuItem(revMenu);
                setMostOrderedItems(mostOrdered);
                setAverageRevenueByDate(avgRev);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="stats-container"><p className="stats-loading">Chargement des statistiques...</p></div>;
    if (error) return <div className="stats-container"><p className="stats-error">Erreur : {error}</p></div>;

    const revenueDateData = Object.entries(revenueByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const revenueMenuData = Object.entries(revenueByMenuItem)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);

    const mostOrderedData = [...mostOrderedItems]
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 6);
    const maxOrdered = mostOrderedData.length > 0
        ? Math.max(...mostOrderedData.map(i => i.totalQuantity))
        : 1;

    const avgRevenueData = [...averageRevenueByDate]
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="stats-container">
            <p className="stats-kicker">Performance et tendances du restaurant</p>
            <h1 className="stats-heading">Statistiques</h1>

            <div className="stats-grid-top">
                <div className="stats-card stats-card-green">
                    <p className="stats-card-title">Revenu total par date</p>
                    {revenueDateData.length === 0 ? (
                        <p className="stats-empty">Aucune donnée disponible.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={revenueDateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,239,0.08)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111', border: '0.5px solid rgba(123,201,160,0.3)', fontSize: 12 }}
                                    labelStyle={{ color: '#F5F3EF' }}
                                    formatter={(value) => [`${value.toFixed(2)} CFA`, 'Revenu']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#7bc9a0" strokeWidth={2} dot={{ fill: '#7bc9a0', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="stats-card stats-card-orange">
                    <p className="stats-card-title">Plats les plus commandés</p>
                    {mostOrderedData.length === 0 ? (
                        <p className="stats-empty">Aucune donnée disponible.</p>
                    ) : (
                        <div className="stats-bar-list">
                            {mostOrderedData.map(item => (
                                <div key={item.name} className="stats-bar-row">
                                    <div className="stats-bar-row-header">
                                        <span>{item.name}</span>
                                        <span>{item.totalQuantity}</span>
                                    </div>
                                    <div className="stats-bar-track">
                                        <div
                                            className="stats-bar-fill stats-bar-fill-orange"
                                            style={{ width: `${(item.totalQuantity / maxOrdered) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid-bottom">
                <div className="stats-card stats-card-blue">
                    <p className="stats-card-title">Revenu par plat</p>
                    {revenueMenuData.length === 0 ? (
                        <p className="stats-empty">Aucune donnée disponible.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={revenueMenuData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,239,0.08)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 8 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-20}
                                    textAnchor="end"
                                    height={50}
                                />
                                <YAxis tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111', border: '0.5px solid rgba(107,155,217,0.3)', fontSize: 12 }}
                                    labelStyle={{ color: '#F5F3EF' }}
                                    formatter={(value) => [`${value.toFixed(2)} CFA `, 'Revenu']}
                                />
                                <Bar dataKey="revenue" fill="#6b9bd9" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="stats-card stats-card-purple">
                    <p className="stats-card-title">Revenu moyen par session</p>
                    {avgRevenueData.length === 0 ? (
                        <p className="stats-empty">Aucune donnée disponible.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={avgRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,239,0.08)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(245,243,239,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111', border: '0.5px solid rgba(185,138,217,0.3)', fontSize: 12 }}
                                    labelStyle={{ color: '#F5F3EF' }}
                                    formatter={(value) => [`${value.toFixed(2)} CFA`, 'Moyenne']}
                                />
                                <Bar dataKey="averageRevenue" fill="#b98ad9" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <button className="stats-back-btn" onClick={() => window.location.href = '/admin'}>
                ← Retour à l'administration
            </button>
        </div>
    );
};

export default StatsPage;