package models


object RuntimeClassLoader : ClassLoader() {
    private val classes = mutableMapOf<Int, Class<*>>()

    fun loadClass(b: ByteArray): Class<*> {
        return classes.computeIfAbsent(b.contentHashCode()) {
            defineClass(b, 0, b.size)
        }
    }
}
