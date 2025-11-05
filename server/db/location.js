// Import the MySQL connection
const db = require('./db')

// Get all locations with pagination
function getLocations(page, callback) {
  const limit = 20 // only return max 20 results per page
  const offset = (page - 1) * limit // skip previous pages

  // First, count how many total records we have
  db.query("SELECT COUNT(*) AS total FROM locations", (err, countResult) => {
    if (err) { 
      return callback(err) 
    } // return error to route

    const total = countResult[0].total // total number of rows
    const totalPages = Math.ceil(total / limit)

    // Then, get only current page records
    db.query("SELECT * FROM locations LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
      if (err) { 
        return callback(err) 
      }
      callback(null, { page, totalPages, data: rows }) // send data to route
    })
  })
}

// Add new location
function addLocation(name, callback) {
  db.query("INSERT INTO locations (name) VALUES (?)", [name], (err, result) => {
    if (err) { 
      return callback(err) 
    }
    callback(null, { id: result.insertId, name }) // return new row info
  })
}

// Update location name by ID
function updateLocation(id, name, callback) {
  db.query("UPDATE locations SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) { 
      return callback(err) 
    }
    callback(null, { id, name }) // return updated info
  })
}

// Delete a location by ID
function deleteLocation(id, callback) {
  db.query("DELETE FROM locations WHERE id = ?", [id], (err) => {
    if (err) { 
      return callback(err) 
    }
    callback(null, { deleted: true }) // confirm deletion
  })
}

// Export functions so routes can use them
module.exports = { getLocations, addLocation, updateLocation, deleteLocation }
