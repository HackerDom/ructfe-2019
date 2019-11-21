import decoder.decodeMessage
import freemarker.cache.ClassTemplateLoader
import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.StatusPages
import io.ktor.freemarker.FreeMarker
import io.ktor.freemarker.FreeMarkerContent
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.files
import io.ktor.http.content.static
import io.ktor.http.content.staticRootFolder
import io.ktor.request.receiveChannel
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondRedirect
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.sessions.*
import io.ktor.util.KtorExperimentalAPI
import io.ktor.util.hex
import io.ktor.util.toByteArray
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonParsingException
import managers.UserManager
import messages.RegisterData
import messages.UserPair
import messages.UserPosData
import java.io.File

data class AuthSession(
    val uid: Int
)


suspend fun clearCookieAndGoLoginPage(call: ApplicationCall) {
    call.sessions.clear<AuthSession>()
    call.respondRedirect("/login_page")
}


@UnstableDefault
@KtorExperimentalAPI
@ExperimentalStdlibApi
fun main() {
    init()
    val userManager = UserManager()
    val server = embeddedServer(Netty, 8080) {
        install(FreeMarker) {
            templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
        }

        install(Sessions) {
            val secretHashKey = hex("6269746c792e636f6d2f39384b386548")
            val sessionStorage = SessionStorageMemory()
            cookie<AuthSession>("sid", sessionStorage) {
                transform(SessionTransportTransformerMessageAuthentication(secretHashKey, "HmacSHA256"))
            }
        }

        install(StatusPages) {
            exception<Throwable> { cause ->
                cause.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError)
            }
        }
        routing {
            static("static") {
                staticRootFolder = File("src/main/resources/static")
                files("js")
                files("css")
            }
            get("/info") {
                val session = call.sessions.get<AuthSession>()
                session?.uid?.let { uid ->
                    val user = userManager.userById(uid)
                    user?.let {
                        val info = userManager.info(user)
                        call.respondBytes(
                            decodeMessage(info.key, info.message),
                            ContentType("application", "json")
                        )
                    }
                } ?: call.respondRedirect("/login_page")
            }
            post("/login") {
                try {
                    val content = call.receiveChannel().toByteArray().decodeToString()
                    val userPair = Json.parse(UserPair.serializer(), content)
                    userManager.validate(userPair)?.let { user ->
                        call.sessions.set(AuthSession(user.id.value))
                        call.respondRedirect("/")
                        return@post
                    }
                    call.respond(HttpStatusCode.BadRequest)
                } catch (e: JsonParsingException) {
                    call.respond(HttpStatusCode.BadRequest)
                }
            }
            post("/register") {
                val rawRegData = call.receiveChannel().toByteArray().decodeToString()
                val regData = Json.parse(RegisterData.serializer(), rawRegData)

                if (userManager.isUserExists(regData.name)) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Username ${regData.name} already exist"
                    )
                } else {
                    val newUserId = userManager.createNewUser(regData)
                    call.sessions.set(AuthSession(newUserId))
                    call.respondRedirect("/")
                }
            }
            get("/login_page") {
                call.sessions.clear<AuthSession>()
                call.respond(FreeMarkerContent("login_page.ftl", emptyMap<String, String>()))
            }
            get("/register_page") {
                call.sessions.clear<AuthSession>()
                call.respond(FreeMarkerContent("register_page.ftl", emptyMap<String, String>()))
            }
            get("/info_page") {
                call.respond(FreeMarkerContent("info_page.ftl", emptyMap<String, String>()))
            }
            get("/") {
                val session = call.sessions.get<AuthSession>()
                session?.uid?.let { uid ->
                    val user = userManager.userById(uid)
                    user?.let {
                        call.respond(FreeMarkerContent("draw.ftl", mapOf("username" to user.name)))
                    }
                } ?: clearCookieAndGoLoginPage(call)
            }
            get("/users") {
                val session = call.sessions.get<AuthSession>()
                session?.uid?.let { uid ->
                    val user = userManager.userById(uid)
                    user?.let {
                        val rawUsers = userManager.users.map { usr ->
                            Json.stringify(UserPosData.serializer(), usr.toPosData())
                        }
                            .toString()
                            .encodeToByteArray()
                        call.respondBytes(rawUsers, ContentType("application", "json"))
                    }
                } ?: call.respondRedirect("/login_page")
            }
            get("/logout") {
                clearCookieAndGoLoginPage(call)
            }
        }
    }
    server.start(wait = true)
}
