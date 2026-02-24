import { apiUrl } from '../utils/config';

const apiPath = "/api/locations";

export async function getLocations(page = 1) {
    const res = await fetch(apiUrl(`${apiPath}?page=${page}`));
    return res.json();
}

export async function getLocation(id) {
    const res = await fetch(apiUrl(`${apiPath}/${id}`));
    if (!res.ok) throw new Error(`Failed to fetch location ${id}: ${res.status}`);
    return res.json();
}

export async function createLocation(payload) {
    const res = await fetch(apiUrl(apiPath), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create location: ${res.status}`);
    return res.json();
}

export async function updateLocation(id, payload) {
    const res = await fetch(apiUrl(`${apiPath}/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update location ${id}: ${res.status}`);
    return res.json();
}

export async function deleteLocation(id) {
    const res = await fetch(apiUrl(`${apiPath}/${id}`), { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete location ${id}: ${res.status}`);
    if (res.status === 204) return null;
    return res.json();
}

export default {
    getLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
};
