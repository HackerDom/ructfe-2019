package messages
import kotlinx.serialization.Serializable


@Serializable
data class UserPair(
    val name: String,
    val password: String
)
