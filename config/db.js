/**
 * this file contains configuration values for db
 */
module.exports = {
    dialect: 'mysql',
    hostname: 'conceptionarydbnew.cgc0jcanhg8a.us-east-1.rds.amazonaws.com',
    port: 3306,
    database: 'conceptionary',
    username: 'root',
    password: 'root',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};