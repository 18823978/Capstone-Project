const { Sequelize, DataTypes } = require('sequelize');

describe('LeaveRequest Model', () => {
  let sequelize;
  let LeaveRequest;
  let User;

  beforeAll(async () => {
    // Create in-memory SQLite database connection
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    });

    // Initialize User model
    User = sequelize.define('User', {
      staff_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING
    });

    // Initialize LeaveRequest model
    LeaveRequest = sequelize.define('LeaveRequest', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      coordinator_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'staff_id'
        }
      },
      deputy_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'staff_id'
        }
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'leave_requests',
      timestamps: true,
      underscored: true
    });

    // Set up associations
    LeaveRequest.belongsTo(User, {
      foreignKey: 'coordinator_id',
      targetKey: 'staff_id',
      as: 'coordinator'
    });

    LeaveRequest.belongsTo(User, {
      foreignKey: 'deputy_id',
      targetKey: 'staff_id',
      as: 'deputy'
    });

    // Add class methods
    LeaveRequest.findById = async function(id) {
      return await this.findByPk(id);
    };

    LeaveRequest.findByStatus = async function(status) {
      return await this.findAll({
        where: { status },
        order: [['created_at', 'DESC']]
      });
    };

    // Sync database
    await sequelize.sync({ force: true });

    // Create test users
    await User.create({
      staff_id: '12345678',
      first_name: 'John',
      last_name: 'Doe'
    });

    await User.create({
      staff_id: '87654321',
      first_name: 'Jane',
      last_name: 'Smith'
    });
  });

  afterEach(async () => {
    // Clear leave request data after each test
    await LeaveRequest.destroy({ where: {} });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('findById', () => {
    it('should find a leave request by id', async () => {
      // Create test data
      const testRequest = await LeaveRequest.create({
        coordinator_id: '12345678',
        deputy_id: '87654321',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        status: 'pending'
      });

      // Test findById method
      const foundRequest = await LeaveRequest.findById(testRequest.id);
      
      expect(foundRequest).not.toBeNull();
      expect(foundRequest.id).toBe(testRequest.id);
      expect(foundRequest.coordinator_id).toBe('12345678');
      expect(foundRequest.deputy_id).toBe('87654321');
      expect(foundRequest.status).toBe('pending');
    });

    it('should return null when leave request not found', async () => {
      const foundRequest = await LeaveRequest.findById(99999);
      expect(foundRequest).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should find leave requests by status', async () => {
      // Create multiple test data
      await LeaveRequest.create({
        coordinator_id: '12345678',
        deputy_id: '87654321',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        status: 'approved'
      });

      await LeaveRequest.create({
        coordinator_id: '12345678',
        deputy_id: '87654321',
        start_date: '2024-03-06',
        end_date: '2024-03-10',
        status: 'approved'
      });

      // Test findByStatus method
      const approvedRequests = await LeaveRequest.findByStatus('approved');
      
      expect(approvedRequests).toHaveLength(2);
      approvedRequests.forEach(request => {
        expect(request.status).toBe('approved');
      });
    });

    it('should return empty array when no requests found with given status', async () => {
      const rejectedRequests = await LeaveRequest.findByStatus('rejected');
      expect(rejectedRequests).toHaveLength(0);
    });
  });
}); 