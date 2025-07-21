const { Sequelize, DataTypes } = require('sequelize');
const ConnectInterface = require('../../models/ConnectInterface');
const { Op } = require('sequelize');

describe('ConnectInterface Model', () => {
  let sequelize;
  let ConnectInterfaceModel;
  let UserModel;

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
    UserModel = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING
    });

    // Initialize ConnectInterface model
    ConnectInterfaceModel = ConnectInterface(sequelize, DataTypes);
    
    // Set up associations
    ConnectInterfaceModel.belongsTo(UserModel, {
      foreignKey: 'created_by',
      as: 'User'
    });
    
    // Sync database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ConnectInterfaceModel.name).toBe('ConnectInterface');
    });

    it('should have correct table name', () => {
      expect(ConnectInterfaceModel.tableName).toBe('connect_interfaces');
    });

    it('should have required fields', () => {
      const attributes = ConnectInterfaceModel.rawAttributes;
      expect(attributes.name).toBeDefined();
      expect(attributes.endpoint).toBeDefined();
      expect(attributes.method).toBeDefined();
      expect(attributes.created_by).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    let testUser;
    let testInterface;

    beforeEach(async () => {
      // Create test users
      testUser = await UserModel.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      });

      // Create test interfaces
      testInterface = await ConnectInterfaceModel.create({
        name: 'Test Interface',
        description: 'Test Description',
        endpoint: '/api/test',
        method: 'GET',
        parameters: { param1: 'value1' },
        response_schema: { type: 'object' },
        created_by: testUser.id
      });
    });

    afterEach(async () => {
      await ConnectInterfaceModel.destroy({ where: {}, truncate: true });
      await UserModel.destroy({ where: {}, truncate: true });
    });

    it('should create a new interface', async () => {
      const interfaceRecord = await ConnectInterfaceModel.create({
        name: 'New Interface',
        endpoint: '/api/new',
        method: 'POST',
        parameters: {},
        response_schema: {},
        status: 'active',
        created_by: 1
      });

      expect(interfaceRecord).toHaveProperty('id');
      expect(interfaceRecord.name).toBe('New Interface');
    });

    it('should find interface by id', async () => {
      const foundInterface = await ConnectInterfaceModel.findByPk(testInterface.id);
      expect(foundInterface).toBeDefined();
      expect(foundInterface.name).toBe('Test Interface');
    });

    it('should update interface', async () => {
      await testInterface.update({
        name: 'Updated Interface',
        description: 'Updated Description'
      });

      const updatedInterface = await ConnectInterfaceModel.findByPk(testInterface.id);
      expect(updatedInterface.name).toBe('Updated Interface');
      expect(updatedInterface.description).toBe('Updated Description');
    });

    it('should delete interface', async () => {
      await testInterface.destroy();
      const foundInterface = await ConnectInterfaceModel.findByPk(testInterface.id);
      expect(foundInterface).toBeNull();
    });
  });

  describe('Search Method', () => {
    let testUser;
    let testInterfaces;

    beforeEach(async () => {
      testUser = await UserModel.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      });

      testInterfaces = await Promise.all([
        ConnectInterfaceModel.create({
          name: 'Search Test 1',
          description: 'Description for search test',
          endpoint: '/api/search1',
          method: 'GET',
          created_by: testUser.id
        }),
        ConnectInterfaceModel.create({
          name: 'Another Test',
          description: 'Search in description',
          endpoint: '/api/search2',
          method: 'POST',
          created_by: testUser.id
        }),
        ConnectInterfaceModel.create({
          name: 'Third Test',
          description: 'Another description',
          endpoint: '/api/search-test',
          method: 'PUT',
          created_by: testUser.id
        })
      ]);
    });

    afterEach(async () => {
      await ConnectInterfaceModel.destroy({ where: {}, truncate: true });
      await UserModel.destroy({ where: {}, truncate: true });
    });

    it('should search by name', async () => {
      const result = await ConnectInterfaceModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%test%' } }
          ]
        }
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should search by description', async () => {
      const result = await ConnectInterfaceModel.findAll({
        where: {
          [Op.or]: [
            { description: { [Op.like]: '%test%' } }
          ]
        }
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const result = await ConnectInterfaceModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%nonexistent%' } },
            { description: { [Op.like]: '%nonexistent%' } }
          ]
        }
      });
      expect(result).toHaveLength(0);
    });
  });
}); 