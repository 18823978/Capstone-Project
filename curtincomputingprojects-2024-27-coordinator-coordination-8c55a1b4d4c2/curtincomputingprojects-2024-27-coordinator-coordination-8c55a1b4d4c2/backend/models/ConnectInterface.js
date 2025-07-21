/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
module.exports = (sequelize, DataTypes) => {
  const ConnectInterface = sequelize.define('ConnectInterface', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
      allowNull: false
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: true
    },
    response_schema: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deprecated'),
      defaultValue: 'active'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'connect_interfaces',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  ConnectInterface.associate = (models) => {
    if (models && models.User) {
      ConnectInterface.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  };

  // Define class methods
  ConnectInterface.search = async function(query) {
    return await this.findAll({
      where: {
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.like]: `%${query}%` } },
          { description: { [sequelize.Op.like]: `%${query}%` } },
          { endpoint: { [sequelize.Op.like]: `%${query}%` } }
        ],
        status: 'active'
      },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  };

  return ConnectInterface;
}; 