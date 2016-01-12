express = require('express')
router = express.Router()
path = require "path"

### GET home page. ###

router.get '/game/create', (req, res) ->
  length = 16
  # TODO: generate a cool id
  id = Math.round(36 ** (length + 1) - (Math.random() * 36 ** length)).toString(36).slice(1)
  res.redirect 301, '/game/' + id

router.get '/game/:id', (req, res) ->
  res.render 'game', title: 'Everyone Is John'
  #res.sendFile path.join __dirname, "../views/game.html"

router.get '/beta/:id', (req, res) ->
  res.sendFile path.join __dirname, "../views/reactgame.html"

router.get '/gm/:id', (req, res) ->
  res.sendFile path.join __dirname, "../views/gm.html"

router.get '/game', (req, res) ->
  res.redirect 301, '/'

router.get '/', (req, res, next) ->
  res.render 'index', title: 'Everyone Is John'

module.exports = router
