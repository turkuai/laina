const BASE_URL = "/locations";

export async function getLocations(page = 1) {
    const res = await fetch(`${BASE_URL}?page=${page}`);
    return res.json();
}

export async function getLocation(id) {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch location ${id}: ${res.status}`);
    return res.json();
}

export async function createLocation(payload) {
    const res = await fetch("/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create location: ${res.status}`);
    return res.json();
}

export async function updateLocation(id, payload) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update location ${id}: ${res.status}`);
    return res.json();
}

export async function deleteLocation(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
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
