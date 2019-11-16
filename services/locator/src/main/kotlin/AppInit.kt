import models.Infos
import models.Users
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import java.sql.Connection.TRANSACTION_SERIALIZABLE


fun init() {
    Database.connect(
//        "jdbc:sqlite:my.db",
        "jdbc:mysql://localhost:3306/test",
//        driver = "org.sqlite.JDBC",
        driver = "com.mysql.jdbc.Driver",
        user = "root", password = "12341234"
    )
    TransactionManager.manager.defaultIsolationLevel = TRANSACTION_SERIALIZABLE
    transaction {
        SchemaUtils.create(Users, Infos)
    }
}
