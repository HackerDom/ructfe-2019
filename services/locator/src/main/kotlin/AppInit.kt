import models.Infos
import models.Users
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import java.sql.Connection.TRANSACTION_SERIALIZABLE


fun init() {
    Database.connect(
        "jdbc:postgresql://db:5432/locator",
        driver = "org.postgresql.Driver",
        user = "postgres"
    )
    TransactionManager.manager.defaultIsolationLevel = TRANSACTION_SERIALIZABLE
    transaction {
        SchemaUtils.create(Users, Infos)
    }
}
