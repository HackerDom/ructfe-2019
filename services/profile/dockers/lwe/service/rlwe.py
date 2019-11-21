import random
import numpy as np
from numpy.polynomial import polynomial as p


rand = random.SystemRandom()

def uniform(n, lower, upper):
    return np.array([rand.randint(lower, upper) for _ in range(n)], dtype=np.int)

def op(a, b):
    c = np.fft.ifft(np.fft.fft(a, a.size * 2) * np.fft.fft(b, b.size * 2)).real
    return (c[0:a.size] - c[a.size:]).astype(np.int)


class RLWE:
    def __init__(self, n, q, b):
        self.n = n
        self.q = q
        self.b = b
        self.a = np.array([
            592, 476, 894, 411, 843, 634, 904, 322, 
            424, 368, 164, 47, 698, 778, 222, 680
            ])
        self.secret_bits = np.unpackbits(uniform(4, 0, 255).astype(np.uint8))
    
    def generate_keys(self):
        s = uniform(self.n, -self.b, self.b).astype(np.uint8)
        e = uniform(self.n, -self.b, self.b).astype(np.uint8)
        pub = (self.a * s + e) % self.q
        priv = s, e
        return pub, priv

    def sign(self, msg, priv):
        s, e = map(np.array, priv)
        msg = np.array(list(msg))
        y1 = uniform(self.n, -self.b, self.b).astype(np.uint8)
        y2 = uniform(self.n, -self.b, self.b).astype(np.uint8)
        w = (self.a*y1 + y2) % self.q
        c = (w + msg) % self.q
        z1 = (s*c + y1) % self.q
        z2 = (e*c + y2) % self.q
        return c, z1, z2

    def verify(self, msg, pub, sign):
        msg = np.array(list(msg))
        pub = np.array(pub)
        c, z1, z2 = map(np.array, sign)
        return all(c == ((self.a*z1 + z2 - pub*c) + msg) % self.q)
