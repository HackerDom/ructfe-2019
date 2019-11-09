package messages
import kotlinx.serialization.Serializable


@Serializable
data class UserPair(
    val id: Int,
    val password: String
)
