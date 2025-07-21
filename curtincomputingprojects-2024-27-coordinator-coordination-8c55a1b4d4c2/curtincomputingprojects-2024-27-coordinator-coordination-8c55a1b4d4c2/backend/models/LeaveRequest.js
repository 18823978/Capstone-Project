/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define('LeaveRequest', {
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
    deputy_id: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'users',
        key: 'staff_id'
      }
    },
    course_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duties: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_short_leave: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'leave_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  LeaveRequest.associate = (models) => {
    if (models && models.User) {
      LeaveRequest.belongsTo(models.User, {
        foreignKey: 'coordinator_id',
        targetKey: 'staff_id',
        as: 'coordinator'
      });
      LeaveRequest.belongsTo(models.User, {
        foreignKey: 'deputy_id',
        targetKey: 'staff_id',
        as: 'deputy'
      });
    }
  };

  // Define class methods
  LeaveRequest.findPendingRequests = async function() {
    return await this.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'coordinator',
          foreignKey: 'coordinator_id'
        },
        {
          model: this.sequelize.models.User,
          as: 'deputy',
          foreignKey: 'deputy_id'
        }
      ]
    });
  };

  LeaveRequest.findByCoordinatorId = async function(coordinatorId) {
    return await this.findAll({
      where: { coordinator_id: coordinatorId },
      order: [['created_at', 'DESC']]
    });
  };

  LeaveRequest.findById = async function(id) {
    return await this.findByPk(id, {
      include: [
        {
          model: this.sequelize.models.User,
          as: 'coordinator',
          foreignKey: 'coordinator_id'
        },
        {
          model: this.sequelize.models.User,
          as: 'deputy',
          foreignKey: 'deputy_id'
        }
      ]
    });
  };

  LeaveRequest.findByStatus = async function(status) {
    return await this.findAll({
      where: { status: status },
      order: [['created_at', 'DESC']]
    });
  };

  return LeaveRequest;
};