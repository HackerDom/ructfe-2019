package models

//import org.jetbrains.exposed.dao.EntityID
//import org.jetbrains.exposed.dao.IntEntity
//import org.jetbrains.exposed.dao.IntEntityClass
//import org.jetbrains.exposed.dao.IntIdTable
//
//
//object Messages: IntIdTable() {
//    val content = text("content")
//    val sender = reference("sender", Users)
//    val receiver = reference("receiver", Users)
//}
//
//
//class Message(id: EntityID<Int>): IntEntity(id) {
//    companion object: IntEntityClass<Message>(Messages)
//
//    var content by Messages.content
//    var sender by User referencedOn Messages.sender
//    var receiver by User referencedOn Messages.receiver
//}
