var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			/*if unique is set to true,it ensures there is no duplicate record for the column*/
			validate: {
				isEmail: true /*built in property of sequelize for email validation */
			}
		},
		salt: { /*same passwords may have same hashing ,but it can be differentiated by salting*/
			type: DataTypes.STRING
		},
		password_hash: { /*hashing the password*/
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			/*virtual will make this column still accessible but not saved in database*/
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) { /*value is nothing but the password*/
				var salt = bcrypt.genSaltSync(10); /*creating a salt pattern*/
				var hashedPassword = bcrypt.hashSync(value, salt); /*hashSync method hashes the password by taking in two argument,one being the password(value) and the salt key generated*/

				this.setDataValue('password', value); /*setDataValue accepts two arguments one being the column name then the value*/
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: { /*hooks are the third argument to sequelize that allows some utility function*/
			beforeValidate: function(user, options) { /*this function will be called before sequelize validations*/
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: { /*classMethods is a object that contains the  functions that is accessible*/
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { //compare sync compare the plain text password with the hashed one
							return reject();
						}
						resolve(user);
					}, function(e) {
						reject();
					})
				});
			}
		},
		instanceMethods: { /*instanceMethods is a object that contains the  functions that is accessible in its instance*/
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt')
			}
		}
	});

	return user;
};