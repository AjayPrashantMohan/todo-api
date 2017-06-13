module.exports = function(db) {
	return {
		requireAuthentication: function(req,res,next){
			var token = req.get('Auth');
			db.user.findByToken(token).then(function(user){//findByToken is in user.js
				req.user = user;
				next();
			},function(){
				res.status(401).send();
			})
		}
	};
};