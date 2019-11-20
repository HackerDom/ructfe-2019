package messages

import kotlinx.serialization.Serializable


@Serializable
data class UserPosData(
    val x: Int,
    val y: Int,
    val color: String,
    val id: Int,
    val speed: Float,
    val size: Int
)
