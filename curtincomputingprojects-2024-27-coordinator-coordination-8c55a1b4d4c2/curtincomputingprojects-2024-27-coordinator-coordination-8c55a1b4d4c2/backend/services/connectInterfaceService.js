const models = require('../models');
const { Op } = require('sequelize');

exports.searchInterfaces = async (keyword, page, limit) => {
  const offset = (page - 1) * limit;
  const where = keyword ? {
    [Op.or]: [
      { name: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ]
  } : {};

  const { count, rows } = await models.ConnectInterface.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

exports.createInterface = async (interfaceData) => {
  return await models.ConnectInterface.create(interfaceData);
};

exports.updateInterface = async (id, interfaceData) => {
  const interfaceRecord = await models.ConnectInterface.findByPk(id);
  if (!interfaceRecord) {
    return null;
  }
  await interfaceRecord.update(interfaceData);
  return interfaceRecord;
}; 