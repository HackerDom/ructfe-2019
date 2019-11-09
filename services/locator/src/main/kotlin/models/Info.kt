package models

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.IntIdTable
import java.sql.Blob
import javax.sql.rowset.serial.SerialBlob


object Infos : IntIdTable() {
    val schema = blob("schema")
    val content = blob("content")
}


class Info(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<Info>(Infos)

    var schema: ByteArray by Infos.schema.transform({ SerialBlob(it) }, { it.toByteArray() })
    var content by Infos.content.transform({ SerialBlob(it) }, { it.toByteArray() })

    fun initializeInstance(): Any {
        val clazz = RuntimeClassLoader.loadClass(schema)
        return clazz.getConstructor(ByteArray::class.java).newInstance(content)
    }
}


internal fun Blob.toByteArray(): ByteArray {
    return binaryStream.readAllBytes()
}
