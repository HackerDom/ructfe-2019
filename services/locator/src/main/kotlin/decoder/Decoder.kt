package decoder

import com.fasterxml.jackson.databind.ObjectMapper
import models.RuntimeClassLoader
import java.io.ByteArrayOutputStream


private val objectMapper = ObjectMapper()

fun decodeMessage(key: ByteArray, message: String): ByteArray {
    val clazz = RuntimeClassLoader.loadClass(key)
    val obj = clazz.newInstance()
    val keys = clazz.fields.map { it.name }.sorted()

    val lens = message.split(":").subList(0, clazz.fields.size).map { it.toInt() }
    val vals = message.substring(lens.joinToString(":").length + 1)
    var offset = 0
    for (i in lens.indices) {
        val len = lens[i]
        clazz.getField(keys[i]).set(obj, vals.substring(offset, offset + len))
        offset += len
    }
    val os = ByteArrayOutputStream()
    objectMapper.writeValue(os, obj)
    return os.toByteArray()
}
