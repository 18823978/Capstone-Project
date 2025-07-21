module.exports = (sequelize, DataTypes) => {
  const Component = sequelize.define('Component', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    component_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    schedule: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    }
  }, {
    tableName: 'components',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Component.associate = (models) => {
    if (models && models.Course) {
      Component.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course'
      });
    }
  };

  return Component;
}; 