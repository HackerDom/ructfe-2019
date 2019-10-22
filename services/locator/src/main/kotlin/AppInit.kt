import models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction


fun init() {
    Database.connect(
        "jdbc:mysql://localhost:3306/test",
        driver = "com.mysql.jdbc.Driver",
        user = "root", password = "12341234"
    )
    transaction {
        SchemaUtils.create(Users)
    }
}
