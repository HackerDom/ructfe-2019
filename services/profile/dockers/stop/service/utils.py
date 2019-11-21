def bytes_to_long(x):
    return int(x.hex(), 16)

def long_to_bytes(x):
    return bytes.fromhex(hex(x)[2:])

def bytes_to_bits(x, size):
    x = bytes_to_long(x)
    for _ in range(size):
        yield x & 1
        x <<= 1

def join_signature(s):
    return b''.join(s)

def split_signature(s, size):
    return [s[i:i+size] for i in range(0, len(s), size)]

def split_message(x, w, t):
    x = bytes_to_long(x)
    mask = int('1'*w, 2)

    for _ in range(t):
        yield x & mask
        x >>= w

def n_hash(x, h, n):
    x = b'\0'*(32 - len(x)) + x
    for _ in range(n):
        x = h(x).digest()
    return x