const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getRemedies = async (search = "") => {
    const url = search ? `${BASE_URL}?search=${search}` : BASE_URL;
    const res = await fetch(url);
    return res.json();
};

export const getSingleRemedy = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`);
    return res.json();
};