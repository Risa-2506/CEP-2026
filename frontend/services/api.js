const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.227.184.79:5000/remedies";
// ================= CONFIG =================

// 🔥 PUT YOUR LOCAL IP HERE (IMPORTANT)
const LOCAL_IP = "192.168.0.101"; // ← CHANGE THIS

const configuredBase = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

// Only use WORKING URLs (removed localhost bugs)
const API_BASE_CANDIDATES = [
    configuredBase,
    `http://${LOCAL_IP}:5000`,   // ✅ real device
    "http://10.0.2.2:5000"       // ✅ Android emulator
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


// ================= CORE REQUEST =================

const request = async (method, path, body = null, token = null) => {
    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
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

    throw new Error(lastError?.message || "Unable to connect to backend API.");
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


// ================= EXPORT =================

export const elderlyAPI = {
        notepad: notepadAPI,
        contacts: contactAPI,
        memories: memoryAPI,
        inspirationals: inspirationalAPI,
        places: placesAPI
};

export const API_BASE_URL = API_ROOT;
export const ELDERLY_BASE_URL = ELDERLY_BASE;