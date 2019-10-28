package models


object RuntimeClassLoader : ClassLoader() {
    private val classes = mutableMapOf<Int, Class<*>>()

    fun loadClass(uniqId: Int, b: ByteArray): Class<*> {
        return classes.computeIfAbsent(uniqId) {
            defineClass(b, 0, b.size)
        }
    }
}
