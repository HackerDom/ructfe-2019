package messages

import isValidKey
import kotlinx.serialization.Serializable
import java.util.*


private val nameRegex = "^[a-zA-Z0-9]{3,50}$".toRegex()
private val colorRegex = "^[0-9a-f]{6}$".toRegex();


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
) {
    fun isValid(): Boolean {
        return name.matches(nameRegex) &&
                color.matches(colorRegex) &&
                isValidKey(Base64.getDecoder().decode(content.key))
    }
}
