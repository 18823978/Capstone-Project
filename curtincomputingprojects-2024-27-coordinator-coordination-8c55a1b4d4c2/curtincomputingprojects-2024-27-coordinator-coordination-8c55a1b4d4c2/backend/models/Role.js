module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'roles',
    timestamps: false
  });

  // Set up associations after model definition
  Role.associate = (models) => {
    if (models && models.User) {
      Role.hasMany(models.User, {
        foreignKey: 'role_id',
        as: 'users'
      });
    }
  };

  // Define class methods
  Role.findById = async function(id) {
    return await this.findByPk(id);
  };

  Role.findByName = async function(name) {
    return await this.findOne({
      where: { name }
    });
  };

  return Role;
}; 