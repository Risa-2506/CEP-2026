const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.36:5000/remedies";
// ================= CONFIG =================

// 🔥 PUT YOUR LOCAL IP HERE (IMPORTANT)
const LOCAL_IP = "192.168.1.36"; // Updated to match Expo IP

const configuredBase = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

// Only use WORKING URLs (removed localhost bugs)
const API_BASE_CANDIDATES = [
    configuredBase,
    `http://${LOCAL_IP}:5000`,   // ✅ real device
    "http://10.0.2.2:5000"      // ✅ Android emulator
].filter(Boolean);

const API_ROOT = API_BASE_CANDIDATES[0] || "";
const REMEDY_BASE = `${API_ROOT}/remedies`;
const ELDERLY_BASE = `${API_ROOT}/elderly`;


// ================= HELPERS =================

// ✅ Prevent infinite loading
const fetchWithTimeout = (url, options, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout)
        )
    ]);
};

// ✅ Safe JSON parse
const safeJson = async (res) => {
    try {
        return await res.json();
    } catch {
        return null;
    }
};


let globalAuthToken = null;

export const setGlobalToken = (token) => {
    globalAuthToken = token;
};

// ================= CORE REQUEST =================

const request = async (method, path, body = null) => {
    const headers = { "Content-Type": "application/json" };

    if (globalAuthToken) {
        headers.Authorization = `Bearer ${globalAuthToken}`;
    }

    const options = { method, headers };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let lastError;

    for (const base of API_BASE_CANDIDATES) {
        try {
            const url = `${base}${path}`;
            console.log("🔍 Trying API:", url);

            const res = await fetchWithTimeout(url, options, 5000);
            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error((data && data.message) || `Error ${res.status}`);
            }

            return data || { success: true, data: null };

        } catch (error) {
            console.log("❌ Failed:", base, error.message);
            lastError = error;
        }
    }

    throw new Error(lastError?.message || "Unable to connect to any backend API. Check your internet connection or server status.");
};


// ================= REMEDIES =================

export const getRemedies = async (search = "") => {
    const url = search
        ? `${REMEDY_BASE}?search=${search}`
        : REMEDY_BASE;

    const res = await fetchWithTimeout(url, {}, 5000);
    return res.json();
};

export const getSingleRemedy = async (id) => {
    const res = await fetchWithTimeout(`${REMEDY_BASE}/${id}`, {}, 5000);
    return res.json();
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
        let query = [];

        if (city) query.push(`city=${city}`);
        if (category && category !== "all") query.push(`category=${category}`);

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


// ================= EXPORT =================

export const alzheimerAPI = {
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

export const elderlyAPI = {
    notepad: notepadAPI,
    contacts: contactAPI,
    memories: memoryAPI,
    inspirationals: inspirationalAPI,
    places: placesAPI,
    tasks: elderlyTaskAPI
};

export const API_BASE_URL = API_ROOT;
export const ELDERLY_BASE_URL = ELDERLY_BASE;
