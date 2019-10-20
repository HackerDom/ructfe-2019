package models

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.IntIdTable


object Users : IntIdTable() {
    val name = varchar("name", length = 50).uniqueIndex()
    val coordinates = integer("coordinates")
    val passwordHash = binary("passwordHash", 200)
}

class User(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<User>(Users)

    var name by Users.name
    var coordinates by Users.coordinates
    var passwordHash by Users.passwordHash
    val sent by Message referrersOn Messages.sender
    val received by Message referrersOn Messages.receiver

    val coordinateX: Byte
        get() = (coordinates % 256 - 128).toByte()

    val coordinateY: Byte
        get() = ((coordinates / 256) % 256 - 128).toByte()
}
