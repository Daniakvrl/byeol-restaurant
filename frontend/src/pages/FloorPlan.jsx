import React from 'react';
import './FloorPlan.css';

const LAYOUT = [
    { x: 130, y: 220, shape: 'round', seats: 2, r: 26 },
    { x: 130, y: 360, shape: 'round', seats: 2, r: 26 },
    { x: 130, y: 500, shape: 'round', seats: 2, r: 26 },
    { x: 130, y: 620, shape: 'round', seats: 2, r: 26 },
    { x: 330, y: 220, shape: 'round', seats: 4, r: 34 },
    { x: 500, y: 220, shape: 'round', seats: 4, r: 34 },
    { x: 670, y: 220, shape: 'round', seats: 4, r: 34 },
    { x: 830, y: 220, shape: 'round', seats: 4, r: 34 },
    { x: 322, y: 372, shape: 'square', seats: 4, size: 64 },
    { x: 502, y: 372, shape: 'square', seats: 4, size: 64 },
    { x: 682, y: 372, shape: 'square', seats: 4, size: 64 },
    { x: 915, y: 375, shape: 'booth', seats: 4, w: 70, h: 90 },
];

const STATUS_COLORS = {
    free: '#5ec9c0',
    reserved: '#C9A86A',
    occupied: '#e8735a',
    selected: '#F5F3EF',
};

const STATUS_FILL = {
    free: 'rgba(94, 201, 192, 0.06)',
    reserved: 'rgba(201, 168, 106, 0.08)',
    occupied: 'rgba(232, 115, 90, 0.08)',
};

function getTableStatus(table, activeTableNumbers, reservations) {
    const isActive = activeTableNumbers.includes(table.tableName);
    if (isActive) return { status: 'occupied' };

    const reservation = reservations.find(
        (r) => r.table && r.table.tableNumber === table.tableName
    );
    if (reservation) {
        return { status: 'reserved', time: reservation.reservationTime?.slice(0, 5) };
    }

    return { status: 'free' };
}

function renderSeats(cx, cy, count, radius, color) {
    const seats = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;
        seats.push(
            <circle key={i} cx={sx} cy={sy} r={count > 4 ? 9 : 11} fill="none" stroke={color} strokeWidth="1.3" opacity="0.6" />
        );
    }
    return seats;
}

const FloorPlan = ({ tables, activeTableNumbers = [], reservations = [], onTableClick, selectable = false, selectedTableName = null }) => {
    const slots = tables.slice(0, LAYOUT.length).map((table, i) => ({
        table,
        layout: LAYOUT[i],
    }));

    return (
        <div className="floorplan-wrap">
            <div className="floorplan-legend">
                <div className="floorplan-legend-item">
                    <span className="floorplan-dot" style={{ background: STATUS_COLORS.free }} />
                    <span>Libre</span>
                </div>
                <div className="floorplan-legend-item">
                    <span className="floorplan-dot" style={{ background: STATUS_COLORS.reserved }} />
                    <span>Réservée</span>
                </div>
                <div className="floorplan-legend-item">
                    <span className="floorplan-dot" style={{ background: STATUS_COLORS.occupied }} />
                    <span>Occupée</span>
                </div>
                {selectable && (
                    <div className="floorplan-legend-item">
                        <span className="floorplan-dot" style={{ background: STATUS_COLORS.selected }} />
                        <span>Sélectionnée</span>
                    </div>
                )}
            </div>

            <svg viewBox="0 0 1000 500" className="floorplan-svg">
                <rect x="50" y="40" width="900" height="420" fill="none" stroke="rgba(245,243,239,0.12)" strokeWidth="1" />
                <rect x="440" y="32" width="120" height="16" fill="#0a0908" />
                <text x="500" y="44" textAnchor="middle" fill="rgba(245,243,239,0.3)" fontSize="9" letterSpacing="3">
                    ENTRÉE PRINCIPALE
                </text>

                {slots.map(({ table, layout }, index) => {
                    if (!table) return null;
                    const { status, time } = getTableStatus(table, activeTableNumbers, reservations);
                    const isSelected = selectable && selectedTableName === table.tableName;
                    const color = isSelected ? STATUS_COLORS.selected : STATUS_COLORS[status];
                    const fill = STATUS_FILL[status];
                    const clickable = selectable ? status === 'free' || isSelected : true;

                    const handleClick = () => {
                        if (!clickable) return;
                        onTableClick(table, status);
                    };

                    const commonTextColor = isSelected ? '#F5F3EF' : color;
                    const key = table.tableName || `table-${index}`;

                    if (layout.shape === 'round') {
                        return (
                            <g key={key} onClick={handleClick} className={`floorplan-table ${!clickable ? 'floorplan-table-disabled' : ''}`}>
                                {renderSeats(layout.x, layout.y, layout.seats, layout.r + 12, color)}
                                <circle cx={layout.x} cy={layout.y} r={layout.r} fill={isSelected ? 'rgba(245,243,239,0.1)' : (status === 'free' ? '#100c09' : fill)} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                                <text x={layout.x} y={layout.y - 3} textAnchor="middle" fill="#F5F3EF" fontFamily="Georgia, serif" fontStyle="italic" fontSize={layout.seats > 2 ? 15 : 14}>
                                    {table.tableName}
                                </text>
                                <text x={layout.x} y={layout.y + 12} textAnchor="middle" fill={commonTextColor} fontSize="8" opacity="0.85">
                                    {isSelected ? 'Choisie' : (status === 'free' ? `${layout.seats} pers.` : (status === 'reserved' ? (time || 'Réservée') : 'Occupée'))}
                                </text>
                            </g>
                        );
                    }

                    if (layout.shape === 'square') {
                        const half = layout.size / 2;
                        return (
                            <g key={key} onClick={handleClick} className={`floorplan-table ${!clickable ? 'floorplan-table-disabled' : ''}`}>
                                {renderSeats(layout.x, layout.y, layout.seats, half + 15, color)}
                                <rect x={layout.x - half} y={layout.y - half} width={layout.size} height={layout.size} rx="4" fill={isSelected ? 'rgba(245,243,239,0.1)' : (status === 'free' ? '#100c09' : fill)} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                                <text x={layout.x} y={layout.y - 4} textAnchor="middle" fill="#F5F3EF" fontFamily="Georgia, serif" fontStyle="italic" fontSize="14">
                                    {table.tableName}
                                </text>
                                <text x={layout.x} y={layout.y + 10} textAnchor="middle" fill={commonTextColor} fontSize="8" opacity="0.85">
                                    {isSelected ? 'Choisie' : (status === 'free' ? `${layout.seats} pers.` : (status === 'reserved' ? (time || 'Réservée') : 'Occupée'))}
                                </text>
                            </g>
                        );
                    }

                    if (layout.shape === 'booth') {
                        const halfW = layout.w / 2;
                        const halfH = layout.h / 2;
                        return (
                            <g key={key} onClick={handleClick} className={`floorplan-table ${!clickable ? 'floorplan-table-disabled' : ''}`}>
                                <rect x={layout.x - halfW} y={layout.y - halfH} width={layout.w} height={layout.h} rx="10" fill={isSelected ? 'rgba(245,243,239,0.1)' : (status === 'free' ? '#100c09' : fill)} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                                <text x={layout.x} y={layout.y - 6} textAnchor="middle" fill="#F5F3EF" fontFamily="Georgia, serif" fontStyle="italic" fontSize="14">
                                    {table.tableName}
                                </text>
                                <text x={layout.x} y={layout.y + 8} textAnchor="middle" fill={commonTextColor} fontSize="7.5" opacity="0.85">
                                    {isSelected ? 'Choisie' : (status === 'free' ? 'Libre' : status === 'reserved' ? (time || 'Réservée') : 'Occupée')}
                                </text>
                            </g>
                        );
                    }

                    return null;
                })}
            </svg>
        </div>
    );
};

export default FloorPlan;