package models

import messages.UserPosData
import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.IntIdTable


object Users : IntIdTable() {
    val name = varchar("name", length = 50).uniqueIndex()
    val coordinates = integer("coordinates")
    val passwordHash = binary("passwordHash", 32)
    val color = varchar("color", length = 6)
    val speed = float("speed")
    val size = integer("size")
    val info = reference("info", Infos)
}


@ExperimentalStdlibApi
class User(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<User>(Users)

    var name by Users.name
    var coordinates by Users.coordinates
    var passwordHash by Users.passwordHash

    var info by Info referencedOn Users.info

    val coordinateX: Byte
        get() = (coordinates % 256).toByte()

    val coordinateY: Byte
        get() = ((coordinates / 256) % 256).toByte()

    var color by Users.color

    var speed by Users.speed
    var size by Users.size

    fun toPosData(): UserPosData {
        return UserPosData(coordinateX.toInt() + 128, coordinateY.toInt() + 128, color, id.value, speed, size)
    }

    override fun toString(): String {
        return "User(name=$name, coordinates=($coordinateX, $coordinateY), color=$color)"
    }
}
