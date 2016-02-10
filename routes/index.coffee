express = require('express')
router = express.Router()
path = require "path"
Chance = require "../public/lib/chance"
chance = new Chance()
animals = require "../private/animals.js"

### GET home page. ###

toCamel = (str)->
  str.replace(/\s(.)/g, ($1) ->
    $1.toUpperCase()
  ).replace(/\s/g, '').replace /^(.)/, ($1) ->
    $1.toLowerCase()

router.get '/game/create', (req, res) ->
  length = 16
  # TODO: generate a cool id
  id = chance.prefix({ full: true }) + animals.gen() + 'Of' + chance.country({full: true}).replace(new RegExp(' ', 'g'), '')
  id = id.replace(/[^a-zA-Z0-9\s[.]/g, "")
  id = toCamel id
  id = id.substr(0,1).toUpperCase() + id.substr 1
  #id = Math.round(36 ** (length + 1) - (Math.random() * 36 ** length)).toString(36).slice(1)
  res.redirect 301, '/gm/' + id
  
router.get '/game/:id', (req, res) ->
  res.sendFile path.join __dirname, "../views/reactgame.html"

router.get '/gm/:id', (req, res) ->
  res.sendFile path.join __dirname, "../views/gm.html"

router.get '/game', (req, res) ->
  res.redirect 301, '/'

router.get '/rules', (req, res) ->
  res.render 'rules', title: 'Everyone Is John | Rules'
  
router.get '/', (req, res, next) ->
  res.render 'index', title: 'Everyone Is John'

module.exports = router
