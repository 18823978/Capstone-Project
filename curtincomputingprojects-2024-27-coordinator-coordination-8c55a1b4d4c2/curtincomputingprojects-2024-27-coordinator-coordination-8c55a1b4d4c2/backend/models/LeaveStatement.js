module.exports = (sequelize, DataTypes) => {
  const LeaveStatement = sequelize.define('LeaveStatement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    leave_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'leave_requests',
        key: 'id'
      }
    },
    author_id: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      references: {
        model: 'users',
        key: 'staff_id'
      }
    },
    statement_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'leave_statements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  LeaveStatement.associate = (models) => {
    if (models && models.User) {
      LeaveStatement.belongsTo(models.User, {
        foreignKey: 'author_id',
        targetKey: 'staff_id',
        as: 'author'
      });
    }
    if (models && models.LeaveRequest) {
      LeaveStatement.belongsTo(models.LeaveRequest, {
        foreignKey: 'leave_request_id',
        as: 'leave_request'
      });
    }
  };

  return LeaveStatement;
}; 