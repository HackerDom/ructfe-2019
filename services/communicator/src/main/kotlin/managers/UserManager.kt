package managers

import messages.UserPair
import models.Messages
import models.User
import models.Users
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.security.MessageDigest
import kotlin.random.Random

class UserManager {
    private val hasher = MessageDigest.getInstance("SHA-256")

    private fun createTables() {
        SchemaUtils.create(Users, Messages)
    }

    fun createNewUser(name: String, password: String) = transaction {
        createTables()
        User.new {
            this.name = name
            this.passwordHash = hasher.digest(password.toByteArray())
            this.coordinates = Random.nextInt(0, 255) * 256 + Random.nextInt(0, 255)
        }
    }

    fun isUserExists(name: String): Boolean = transaction {
        !User.find { Users.name eq name }.empty()
    }

    fun validate(userPair: UserPair): Boolean = transaction {
        User.find { Users.name eq userPair.name }.firstOrNull()?.let { dbUser ->
            hasher.digest(userPair.password.toByteArray())!!.contentEquals(dbUser.passwordHash)
        } ?: false
    }

    val users: List<User>
        get() = transaction {
            createTables()
            User.all().toList()
        }
}
