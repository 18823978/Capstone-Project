/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
const { DataTypes } = require('sequelize');
/**
 * Uses "bcryptjs 2.4.3", MIT License
 * https://github.com/dcodeIO/bcrypt.js
 */
const bcrypt = require('bcryptjs');
const config = require('../config/config');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    staff_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.associate = (models) => {
    if (models && models.Role) {
      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });
    }
    if (models && models.Course) {
      User.hasMany(models.Course, {
        foreignKey: 'coordinator_id',
        as: 'coordinatedCourses'
      });
    }
    if (models && models.LeaveRequest) {
      User.hasMany(models.LeaveRequest, {
        foreignKey: 'coordinator_id',
        as: 'leaveRequests'
      });
    }
    if (models && models.Suggestion) {
      User.hasMany(models.Suggestion, {
        foreignKey: 'coordinator_id',
        as: 'suggestions'
      });
    }
    if (models && models.Session) {
      User.hasMany(models.Session, {
        foreignKey: 'user_id',
        as: 'sessions'
      });
    }
    if (models && models.CoordinatorCourse) {
      User.hasMany(models.CoordinatorCourse, { as: 'coordinatedCourses', foreignKey: 'coordinator_id' });
    }
  };

  // Instance method to check if password matches
  User.prototype.isPasswordMatch = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Virtual field for full name
  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  // Define class methods
  User.findById = async function(id) {
    return await this.findByPk(id);
  };

  User.findByEmail = async function(email) {
    return await this.findOne({
      where: { email }
    });
  };

  User.findByStaffId = async function(staffId) {
    return await this.findOne({
      where: { staff_id: staffId }
    });
  };

  return User;
};