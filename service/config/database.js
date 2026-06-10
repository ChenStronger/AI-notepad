// 数据库配置
const config = require('./index');

module.exports = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
