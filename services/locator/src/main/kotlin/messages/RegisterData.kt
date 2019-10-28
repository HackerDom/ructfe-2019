package messages

import kotlinx.serialization.Serializable

@Serializable
class RegisterData(
    val name: String,
    val password: String,
    val color: String,
    val rawInfoContent: String
)
