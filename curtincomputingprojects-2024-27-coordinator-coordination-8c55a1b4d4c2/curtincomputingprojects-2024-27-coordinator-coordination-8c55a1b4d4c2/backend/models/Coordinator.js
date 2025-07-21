/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
module.exports = (sequelize, DataTypes) => {
  const Coordinator = sequelize.define('Coordinator', {
    // Inherit all fields from User model
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Set up relationship with User model
  Coordinator.associate = (models) => {
    Coordinator.belongsTo(models.User, {
      foreignKey: 'id',
      as: 'user'
    });

    if (models && models.Course) {
      Coordinator.belongsToMany(models.Course, {
        through: 'coordinator_courses',
        foreignKey: 'coordinator_id',
        otherKey: 'course_id',
        as: 'courses'
      });
    }
  };

  // Add Coordinator-specific methods
  Coordinator.findByPk = async function(id) {
    return await this.sequelize.models.User.findByPk(id);
  };

  Coordinator.findAll = async function(options) {
    return await this.sequelize.models.User.findAll({
      ...options,
      where: {
        ...options?.where,
        role_id: 2 // Assuming 2 is the role ID for coordinators
      }
    });
  };

  Coordinator.create = async function(data) {
    return await this.sequelize.models.User.create({
      ...data,
      role_id: 2 // Assuming 2 is the role ID for coordinators
    });
  };

  Coordinator.update = async function(data, options) {
    return await this.sequelize.models.User.update(data, options);
  };

  Coordinator.destroy = async function(options) {
    return await this.sequelize.models.User.destroy(options);
  };

  return Coordinator;
}; 