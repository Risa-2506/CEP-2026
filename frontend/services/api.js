// ============================================================
// frontend/services/api.js
// Centralized API Configuration & Client for Production and Local Dev
// ============================================================

export const DEFAULT_PRODUCTION_URL = "https://cep-2026-8oai.onrender.com";

/**
 * Resolves and normalizes the backend API base URL.
 * Prioritizes EXPO_PUBLIC_API_URL environment variable.
 * Safely defaults to the production Render URL if missing or empty.
 */
export const getApiBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
        let clean = envUrl.trim();
        // Add protocol if missing
        if (!/^https?:\/\//i.test(clean)) {
            // Local dev hosts use http, everything else uses https
            if (/^(localhost|127\.0\.0\.1|192\.168\.|10\.)/i.test(clean)) {
                clean = `http://${clean}`;
            } else {
                clean = `https://${clean}`;
            }
        }
        // Remove trailing slashes and accidental route suffixes
        clean = clean.replace(/\/+$/, "");
        clean = clean.replace(/\/(remedies|api|alzheimer|elderly|doctors)$/i, "");
        return clean;
    }
    return DEFAULT_PRODUCTION_URL;
};

/**
 * Builds a clean, fully-qualified URL for any given API endpoint.
 * Prevents double slashes and missing slashes.
 */
export const buildApiUrl = (endpoint = "") => {
    const base = getApiBaseUrl();
    const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${cleanPath}`;
};

export const API_BASE_URL = getApiBaseUrl();
export const ELDERLY_BASE_URL = `${getApiBaseUrl()}/elderly`;

// ================= AUTH TOKEN MANAGEMENT =================

let globalAuthToken = null;

export const setGlobalToken = (token) => {
    globalAuthToken = token || null;
};

export const getGlobalToken = () => globalAuthToken;

// ================= TIMEOUT & NETWORK HELPERS =================

// Default 60 seconds to accommodate Render free-tier cold starts
const DEFAULT_TIMEOUT_MS = 60000;

const fetchWithTimeout = (url, options = {}, timeout = DEFAULT_TIMEOUT_MS) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => {
                reject(
                    new Error(
                        "Request timed out. The server may be waking up (free tier cold start). Please try again in a few moments."
                    )
                );
            }, timeout)
        )
    ]);
};

const safeJson = async (res) => {
    try {
        return await res.json();
    } catch {
        return null;
    }
};

// ================= CORE REQUEST FUNCTION =================

/**
 * Universal HTTP request function using centralized configuration.
 * Automatically injects JWT Authorization header when logged in.
 */
export const request = async (method, path, body = null, customHeaders = {}, timeout = DEFAULT_TIMEOUT_MS) => {
    const url = buildApiUrl(path);

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...customHeaders
    };

    if (globalAuthToken) {
        headers.Authorization = `Bearer ${globalAuthToken}`;
    }

    const options = {
        method,
        headers
    };

    if (body !== null && body !== undefined) {
        options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    try {
        const res = await fetchWithTimeout(url, options, timeout);
        const data = await safeJson(res);

        if (!res.ok) {
            const errorMessage = (data && (data.message || data.error)) || `Server responded with status ${res.status}`;
            const error = new Error(errorMessage);
            error.status = res.status;
            error.data = data;
            throw error;
        }

        return data !== null ? data : { success: true };
    } catch (error) {
        console.error(`[API ERROR] ${method} ${url}:`, error.message);
        throw error;
    }
};

// ================= AUTHENTICATION API =================

export const authAPI = {
    login: (email, password) =>
        request("POST", "/auth/login", { email, password }),

    signup: (name, email, password) =>
        request("POST", "/auth/signup", { name, email, password }),

    alzheimerSignup: (details) =>
        request("POST", "/auth/alzheimer-signup", details),

    elderlySignup: (details) =>
        request("POST", "/auth/elderly-signup", details),

    getMe: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/auth/me", null, headers);
    },

    syncRole: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("POST", "/auth/sync-role", null, headers);
    },

    roleCheck: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/auth/role-check", null, headers);
    }
};

// ================= REMEDIES API =================

export const getRemedies = async (search = "") => {
    const endpoint = search
        ? `/remedies?search=${encodeURIComponent(search)}`
        : "/remedies";
    return request("GET", endpoint);
};

export const getSingleRemedy = async (id) => {
    return request("GET", `/remedies/${id}`);
};

export const remedyAPI = {
    getAll: getRemedies,
    getById: getSingleRemedy
};

// ================= DOCTORS API =================

export const doctorAPI = {
    getAll: () => request("GET", "/doctors"),
    getById: (id) => request("GET", `/doctors/${id}`),
    create: (doctorData) => request("POST", "/doctors", doctorData)
};

// ================= ELDERLY APIs =================

export const notepadAPI = {
    getAll: () => request("GET", "/elderly/notepad"),
    create: (body) => request("POST", "/elderly/notepad", body),
    update: (id, body) => request("PUT", `/elderly/notepad/${id}`, body),
    delete: (id) => request("DELETE", `/elderly/notepad/${id}`)
};

export const contactAPI = {
    getAll: () => request("GET", "/elderly/contacts"),
    create: (body) => request("POST", "/elderly/contacts", body),
    update: (id, body) => request("PUT", `/elderly/contacts/${id}`, body),
    delete: (id) => request("DELETE", `/elderly/contacts/${id}`)
};

export const memoryAPI = {
    getAll: () => request("GET", "/elderly/memories"),
    create: (body) => request("POST", "/elderly/memories", body),
    update: (id, body) => request("PUT", `/elderly/memories/${id}`, body),
    delete: (id) => request("DELETE", `/elderly/memories/${id}`)
};

export const inspirationalAPI = {
    getToday: () => request("GET", "/elderly/inspirational/today"),
    getAll: () => request("GET", "/elderly/inspirational"),
    save: (body) => request("POST", "/elderly/inspirational", body),
    delete: (id) => request("DELETE", `/elderly/inspirational/${id}`)
};

export const placesAPI = {
    getNearby: (city = "", category = "all") => {
        const query = [];
        if (city) query.push(`city=${encodeURIComponent(city)}`);
        if (category && category !== "all") query.push(`category=${encodeURIComponent(category)}`);
        const queryString = query.length ? `?${query.join("&")}` : "";
        return request("GET", `/elderly/places${queryString}`);
    }
};

export const elderlyTaskAPI = {
    getAll: () => request("GET", "/elderly/tasks"),
    create: (body) => request("POST", "/elderly/tasks", body),
    update: (id, body) => request("PUT", `/elderly/tasks/${id}`, body),
    updateStatus: (id, status) => request("PUT", `/elderly/tasks/${id}/status`, { status }),
    delete: (id) => request("DELETE", `/elderly/tasks/${id}`)
};

export const elderlyProfileAPI = {
    check: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/elderly/check", null, headers);
    },
    create: (details, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("POST", "/elderly", details, headers);
    },
    getMyProfile: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/elderly/my-profile", null, headers);
    }
};

export const elderlyAPI = {
    profile: elderlyProfileAPI,
    notepad: notepadAPI,
    contacts: contactAPI,
    memories: memoryAPI,
    inspirationals: inspirationalAPI,
    places: placesAPI,
    tasks: elderlyTaskAPI
};

// ================= ALZHEIMER APIs =================

export const alzheimerProfileAPI = {
    check: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/alzheimer/check", null, headers);
    },
    create: (details, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("POST", "/alzheimer", details, headers);
    },
    getMyProfile: (token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return request("GET", "/alzheimer/my-profile", null, headers);
    }
};

export const alzheimerAPI = {
    profile: alzheimerProfileAPI,
    notes: {
        getAll: () => request("GET", "/alzheimer/notes"),
        create: (body) => request("POST", "/alzheimer/notes", body),
        update: (id, body) => request("PUT", `/alzheimer/notes/${id}`, body),
        updateStatus: (id, status) => request("PUT", `/alzheimer/notes/${id}/status`, { status }),
        delete: (id) => request("DELETE", `/alzheimer/notes/${id}`)
    },
    tasks: {
        getAll: () => request("GET", "/alzheimer/tasks"),
        create: (body) => request("POST", "/alzheimer/tasks", body),
        update: (id, body) => request("PUT", `/alzheimer/tasks/${id}`, body),
        updateStatus: (id, status) => request("PUT", `/alzheimer/tasks/${id}/status`, { status }),
        delete: (id) => request("DELETE", `/alzheimer/tasks/${id}`)
    },
    game: {
        getAllQuestions: () => request("GET", "/alzheimer/game"),
        createQuestion: (body) => request("POST", "/alzheimer/game", body),
        submitAnswers: (answers) => request("POST", "/alzheimer/game/submit", { answers }),
        getResults: () => request("GET", "/alzheimer/game/results")
    },
    contacts: {
        getAll: () => request("GET", "/alzheimer/contacts"),
        create: (body) => request("POST", "/alzheimer/contacts", body),
        update: (id, body) => request("PUT", `/alzheimer/contacts/${id}`, body),
        delete: (id) => request("DELETE", `/alzheimer/contacts/${id}`)
    },
    geofence: {
        get: () => request("GET", "/alzheimer/geofence"),
        set: (body) => request("POST", "/alzheimer/geofence", body),
        triggerAlert: (body) => request("POST", "/alzheimer/geofence/alert", body)
    },
    alerts: {
        getAll: () => request("GET", "/alzheimer/alerts"),
        acknowledge: (id) => request("PUT", `/alzheimer/alerts/${id}/acknowledge`)
    }
};
