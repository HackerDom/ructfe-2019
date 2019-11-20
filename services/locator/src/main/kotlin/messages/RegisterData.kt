package messages

import kotlinx.serialization.Serializable


@Serializable
class Content(
    val key: String,
    val message: String
)

@Serializable
class RegisterData(
    val name: String,
    val password: String,
    val color: String,
    val size: Int,
    val speed: Float,
    val content: Content
)
