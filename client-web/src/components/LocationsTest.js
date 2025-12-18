import React, { useEffect, useState } from "react";
import { getLocations, createLocation, deleteLocation } from "../api/location.js";

export default function LocationsTest() {
    const [locations, setLocations] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const load = async () => {
        try {
            const res = await getLocations(1);
            setLocations(res.data || []);
        } catch (err) {
            console.error("Failed to load locations", err);
        }
    };

    const handleAdd = async () => {
        try {
            await createLocation({ location_name: name, description });
            setName("");
            setDescription("");
            load();
        } catch (err) {
            console.error("Failed to add", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteLocation(id);
            load();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div>
            <h2>Test Location API</h2>
            <input
                placeholder="New location name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            /> <br /><br />
            <input
                placeholder="New description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            /> <br /><br />
            <button onClick={handleAdd}>Add</button>

            <ul>
                {locations.map((loc) => (
                    <li key={loc.id}>
                        <strong>{loc.location_name}</strong>: {loc.description}
                        <button onClick={() => handleDelete(loc.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
