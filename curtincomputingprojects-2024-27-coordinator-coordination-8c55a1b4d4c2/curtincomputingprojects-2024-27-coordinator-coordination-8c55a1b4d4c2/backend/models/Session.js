module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      references: {
        model: 'users',
        key: 'staff_id'
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Session.associate = (models) => {
    if (models && models.User) {
      Session.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'staff_id',
        as: 'user'
      });
    }
  };

  return Session;
}; 