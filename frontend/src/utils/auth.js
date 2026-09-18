export function decodeJwt(token) {
    if (!token || token === 'null' || token === 'undefined') {
        return null;
    }
    try {
        const parts = token.split('.');
        if (parts.length < 2) {
            return null;
        }
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function getUserRoleFromToken(token) {
    const payload = decodeJwt(token);
    if (!payload) {
        return null;
    }

    const normalize = (value) => {
        if (!value) return null;
        const raw = typeof value === 'string' ? value : value.authority;
        if (raw === 'ROLE_ADMIN' || raw === 'ADMIN') return 'ROLE_ADMIN';
        if (raw === 'ROLE_USER' || raw === 'USER') return 'ROLE_USER';
        return raw || null;
    };

    const fromRole = normalize(payload.role);
    if (fromRole) {
        return fromRole;
    }

    if (Array.isArray(payload.authorities)) {
        if (payload.authorities.some((auth) => normalize(auth) === 'ROLE_ADMIN')) {
            return 'ROLE_ADMIN';
        }
        return 'ROLE_USER';
    }

    return 'ROLE_USER';
}

export function isAdminToken(token) {
    return getUserRoleFromToken(token) === 'ROLE_ADMIN';
}

export function getPostLoginRoute(token, routes) {
    return isAdminToken(token) ? routes.ADMIN : routes.STAFF_HOME;
}
