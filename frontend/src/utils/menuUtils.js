import { API_BASE } from '../constants';

/**
 * Transforme un chemin relatif backend (/images/...) en URL absolue,
 * en encodant les caractères spéciaux (espaces, accents, parenthèses).
 */
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) {
        return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return encodeURI(imageUrl);
    }

    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return encodeURI(`${API_BASE}${normalizedPath}`);
}

/**
 * Formate le prix pour l'affichage.
 */
export function formatPrice(price) {
    const value = Number(price);
    if (Number.isNaN(value)) {
        return '0.00';
    }
    return value.toFixed(2);
}

/**
 * Filtre les plats disponibles côté client.
 */
export function filterAvailableMenuItems(items) {
    if (!Array.isArray(items)) {
        console.warn('[Menu] Expected an array, received:', items);
        return [];
    }

    return items.filter((item) => item.available === true);
}