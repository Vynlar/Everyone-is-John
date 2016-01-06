var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/game/create', function(req, res) {
	var length = 16;
	var id = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	while(this.roomManager.roomExists(id)) {
		id = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	}
	console.log(this.roomManager.addRoom(id));
	res.redirect(301, '/game/' + id);
});

router.get('/game/:id', function(req, res) {
   /* if(!this.roomManager.roomExists(req.params.id)) {
	   res.redirect(301, '/');
	   return;
   } */
   res.render('game', { title: 'Everyone Is John' }); 
});

router.get('/game/:id/delete', function(req, res) {
   /* if(!this.roomManager.roomExists(req.params.id)) {
	   res.redirect(301, '/');
	   return;
   }
   this.roomManager.deleteRoom(req.params.id);
   res.redirect(301, '/?deleted'); */
});


router.get('/game', function(req, res) {
	res.redirect(301, '/');
});


router.get('/', function(req, res, next) {
	
	res.render('index', { title: 'Everyone Is John' });
  
});

module.exports = router;
