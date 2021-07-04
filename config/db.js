// Environment Variables for for database connection
module.exports = {
  host: process.env.dbHost,
  database: process.env.dbName,
  username: process.env.dbUsername,
  password: process.env.dbPassword,
  port: process.env.dbPort
}
