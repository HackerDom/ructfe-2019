import freemarker.cache.ClassTemplateLoader
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.StatusPages
import io.ktor.freemarker.FreeMarker
import io.ktor.freemarker.FreeMarkerContent
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.files
import io.ktor.http.content.static
import io.ktor.http.content.staticRootFolder
import io.ktor.request.receiveChannel
import io.ktor.response.respond
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
import managers.UserManager
import messages.RegisterData
import messages.UserPair
import java.io.File

data class AuthSession(
    val username: String
)


@UnstableDefault
@KtorExperimentalAPI
@ExperimentalStdlibApi
fun main() {
    init()
    val manager = UserManager()
    val server = embeddedServer(Netty, 8080) {
        install(FreeMarker) {
            templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
        }

        install(Sessions) {
            val secretHashKey = hex("6269746c792e636f6d2f39384b386548")
            val sessionStorage = directorySessionStorage(File(".sessions"), cached = true)
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
            get("/") {
                val session = call.sessions.get<AuthSession>()
                session?.username?.let {
                    val user = manager.userByName(it)
                    user?.let {
                        val info = manager.info(user).initializeInstance()
                        val templateMap = mapOf(
                            "user" to user,
                            "info" to info
                        )
                        call.respond(FreeMarkerContent("index.ftl", templateMap))
                    }
                } ?: call.respondRedirect("/login_page")
            }
            post("/login") {
                val content = call.receiveChannel().toByteArray().decodeToString()
                val userPair = Json.parse(UserPair.serializer(), content)
                if (manager.validate(userPair)) {
                    call.sessions.set(AuthSession(userPair.name))
                    call.respondRedirect("/")
                } else {
                    call.respond(HttpStatusCode.BadRequest)
                }
            }
            post("/register") {
                val content = call.receiveChannel().toByteArray().decodeToString()
                val regData = Json.parse(RegisterData.serializer(), content)
                if (manager.isUserExists(regData.name)) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Username ${regData.name} already exist"
                    )
                } else {
                    manager.createNewUser(regData)
                    call.sessions.set(AuthSession(regData.name))
                    call.respondRedirect("/")
                }
            }
            get("/login_page") {
                call.respond(FreeMarkerContent("login_page.ftl", emptyMap<String, String>()))
            }
            get("/register_page") {
                call.respond(FreeMarkerContent("register_page.ftl", emptyMap<String, String>()))
            }
            get("/draw") {
                call.respond(FreeMarkerContent("draw.ftl", emptyMap<String, String>()))
            }
        }
    }
    server.start(wait = true)
}
