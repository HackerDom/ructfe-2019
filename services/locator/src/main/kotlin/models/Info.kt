package models

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.IntIdTable
import java.sql.Blob
import javax.sql.rowset.serial.SerialBlob


object Infos : IntIdTable() {
    val key = blob("key")
    val message = text("message")
}


class Info(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Info>(Infos)

    var key: ByteArray by Infos.key.transform({ SerialBlob(it) }, { it.toByteArray() })
    var message by Infos.message

}


internal fun Blob.toByteArray(): ByteArray {
    return binaryStream.readAllBytes()
}
