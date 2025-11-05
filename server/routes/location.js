// Create express router
const express = require('express')
const router = express.Router()

// Import database functions
const db = require('../db/locations')

// GET /locations?page=1 - list locations with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1 // default to page 1
  db.getLocations(page, (err, result) => {
    if (err) {return res.status(500).json({ error: 'DB error' })} // if fail
    res.json(result) // send data to frontend
  })
})

// POST /locations - create new location
router.post('/', (req, res) => {
  const name = req.body.name
  if (!name) {return res.status(400).json({ error: 'name is required' })} // bad request

  db.addLocation(name, (err, result) => {
    if (err) {return res.status(500).json({ error: 'DB error' })}
    res.status(201).json(result) // send back new row
  })
})

// PATCH /locations/:id - update location name
router.patch('/:id', (req, res) => {
  const id = req.params.id
  const name = req.body.name
  if (!name) {return res.status(400).json({ error: 'name is required' })}

  db.updateLocation(id, name, (err, result) => {
    if (err) {return res.status(500).json({ error: 'DB error' })}
    res.json(result) // send updated info
  })
})

// DELETE /locations/:id - remove location
router.delete('/:id', (req, res) => {
  const id = req.params.id
  db.deleteLocation(id, (err, result) => {
    if (err) {return res.status(500).json({ error: 'DB error' })}
    res.json(result) // confirm deletion
  })
})

// Export the router so server can use it
module.exports = router
