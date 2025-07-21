/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    course_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    major: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    coordinator_id: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'users',
        key: 'staff_id'
      }
    }
  }, {
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  Course.associate = (models) => {
    if (models && models.User) {
      Course.belongsTo(models.User, {
        foreignKey: 'coordinator_id',
        targetKey: 'staff_id',
        as: 'coordinator'
      });
    }
    if (models && models.Component) {
      Course.hasMany(models.Component, {
        foreignKey: 'course_id',
        as: 'components'
      });
    }
  };

  // Define class methods
  Course.findActiveCourses = async function() {
    return await this.findAll({
      include: [{
        model: sequelize.models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }],
      order: [['course_code', 'ASC']]
    });
  };

  Course.findById = async function(id) {
    return await this.findByPk(id, {
      include: [{
        model: sequelize.models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }]
    });
  };

  Course.findByCourseCode = async function(courseCode) {
    return await this.findOne({
      where: { course_code: courseCode },
      include: [{
        model: sequelize.models.User,
        as: 'coordinator',
        attributes: ['staff_id', 'first_name', 'last_name', 'email']
      }]
    });
  };

  return Course;
};