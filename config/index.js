require("dotenv").config()

let dataBase = {}

if( process.env.NODE_ENV === "production" ) {
    dataBase = {
        DB              : process.env.APP_DB,
        PORT            : process.env.PORT,
        SECRET          : process.env.APP_SECRET,
        DB_HOST         : process.env.DB_HOST_AWS,
        DB_USER         : process.env.DB_USER_AWS,
        DB_PASSWORD     : process.env.DB_PASSWORD_AWS,
        DB_DATABASE     : process.env.DB_DATABASE_AWS,
    }
} else if ( process.env.NODE_ENV === "development" ) {
    dataBase = {
        DB              : process.env.APP_DB,
        PORT            : process.env.PORT,
        SECRET          : process.env.APP_SECRET,
        DB_HOST         : process.env.DB_HOST,
        DB_USER         : process.env.DB_USER,
        DB_PASSWORD     : process.env.DB_PASSWORD,
        DB_DATABASE     : process.env.DB_DATABASE,
    }
}

module.exports = dataBase