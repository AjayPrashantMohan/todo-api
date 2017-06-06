module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,/*if unique is set to true,it ensures there is no duplicate record for the column*/
			validate: {
				isEmail: true /*built in property of sequelize for email validation */
			}
		},
		password:{
			type:DataTypes.STRING,
			allowNull:false,
			validate:{
				len:[7,100]
			}
		}
	},{
		hooks:{/*hooks are the third argument to sequelize that allows some utility function*/
			beforeValidate:function(user,options){/*this function will be called before sequelize validations*/
				if(typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		}
	})
};