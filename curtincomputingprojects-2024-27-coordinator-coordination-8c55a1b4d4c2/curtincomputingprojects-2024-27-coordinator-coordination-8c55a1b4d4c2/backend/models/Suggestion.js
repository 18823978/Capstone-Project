module.exports = (sequelize, DataTypes) => {
  const Suggestion = sequelize.define('Suggestion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    coordinator_id: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      references: {
        model: 'users',
        key: 'staff_id'
      }
    },
    suggestion_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'suggestions',
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: false
  });

  Suggestion.associate = (models) => {
    if (models && models.User) {
      Suggestion.belongsTo(models.User, {
        foreignKey: 'coordinator_id',
        targetKey: 'staff_id',
        as: 'coordinator'
      });
    }
  };

  return Suggestion;
}; 