express = require('express')
router = express.Router()

### GET home page. ###

router.get '/game/create', (req, res) ->
  length = 16
  # TODO: generate a cool id
  id = Math.round(36 ** (length + 1) - (Math.random() * 36 ** length)).toString(36).slice(1)
  res.redirect 301, '/game/' + id

router.get '/game/:id', (req, res) ->
  res.render 'game', title: 'Everyone Is John'

router.get '/game', (req, res) ->
  res.redirect 301, '/'

router.get '/', (req, res, next) ->
  res.render 'index', title: 'Everyone Is John'

module.exports = router
