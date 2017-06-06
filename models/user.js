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
	})
};