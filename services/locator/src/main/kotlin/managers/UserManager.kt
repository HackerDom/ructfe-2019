package managers

import messages.RegisterData
import messages.UserPair
import models.Info
import models.User
import models.Users
import org.jetbrains.exposed.sql.transactions.transaction
import java.security.MessageDigest
import java.util.*
import kotlin.random.Random

@ExperimentalStdlibApi
class UserManager {
    private val hasher = MessageDigest.getInstance("SHA-256")

    fun createNewUser(regData: RegisterData): Int = transaction {
        val info = Info.new {
            this.key = Base64.getDecoder().decode(regData.content.key)
            this.message = regData.content.message
        }

        User.new {
            this.name = regData.name
            this.passwordHash = hasher.digest(regData.password.toByteArray())
            this.coordinates = Random.nextInt(0, 255) * 256 + Random.nextInt(0, 255)
            this.color = regData.color
            this.info = info
            this.speed = regData.speed
            this.size = regData.size
        }.id.value
    }

    fun isUserExists(name: String): Boolean = transaction {
        !User.find { Users.name eq name }.empty()
    }

    fun validate(userPair: UserPair): User? = transaction {
        User.find { Users.name eq userPair.name }.firstOrNull()?.let { dbUser ->
            if (hasher.digest(userPair.password.toByteArray())!!.contentEquals(dbUser.passwordHash)) dbUser else null
        }
    }

    fun userById(id: Int): User? = transaction {
        User.findById(id)
    }

    val users: List<User>
        get() = transaction {
            User.all().toList()
        }

    fun info(user: User): Info = transaction {
        user.info
    }
}
