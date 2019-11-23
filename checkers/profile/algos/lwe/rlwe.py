import random
import numpy as np

rand = random.SystemRandom()

def uniform(n, lower, upper):
    return np.array([rand.randint(lower, upper) for _ in range(n)], dtype=np.int)

class RLWE:
    def __init__(self, n, q):
        self.n = n
        self.q = q
        self.b = q // 2
    
    def generate_keys(self):
        s = uniform(self.n, -self.b, self.b)
        e = uniform(self.n, -self.b, self.b)
        a = uniform(self.n, 0, self.q)
        pub = (a * s + e) % self.q, a
        priv = s, e, a
        return pub, priv

    def sign(self, msg, priv):
        s, e, a = map(np.array, priv)
        msg = np.array(list(msg))
        y1 = uniform(self.n, -self.b, self.b)
        y2 = uniform(self.n, -self.b, self.b)
        w = (a*y1 + y2) % self.q
        c = (w + msg) % self.q
        z1 = (s*c + y1) % self.q
        z2 = (e*c + y2) % self.q
        return c, z1, z2

    def verify(self, msg, pub, sign):
        msg = np.array(list(msg))
        pub, a = map(np.array, pub)
        c, z1, z2 = map(np.array, sign)
        return all(c == ((a*z1 + z2 - pub*c) + msg) % self.q)
