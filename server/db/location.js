import db from "./db.js";

// Get all locations with pagination
function getLocations(page, callback) {
  const limit = 20;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS total FROM locations", (err, countResult) => {
    if (err) {
      return callback(err);
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    db.query(
      "SELECT * FROM locations LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) {
          return callback(err);
        }

        callback(null, { page, totalPages, data: rows });
      }
    );
  });
}

// Add new location with description
function addLocation(locationName, description, callback) {
  db.query(
    "INSERT INTO locations (location_name, description) VALUES (?, ?)",
    [locationName, description],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return callback({ error: "Location name already exists" });
        }
        return callback(err);
      }
      callback(null, {
        id: result.insertId,
        location_name: locationName,
        description,
      });
    }
  );
}

// Update location name only
function updateLocation(id, locationName, callback) {
  db.query(
    "UPDATE locations SET location_name = ? WHERE id = ?",
    [locationName, id],
    (err) => {
      if (err) {
        return callback(err);
      }
      callback(null, { id, location_name: locationName });
    }
  );
}

// Delete location
function deleteLocation(id, callback) {
  db.query("DELETE FROM locations WHERE id = ?", [id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null, { deleted: true });
  });
}

export default {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
};
