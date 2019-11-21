__name__ = 'Secure Trading Operation protocol'

from abc import ABC, abstractmethod
from hashlib import sha256
from math import ceil, floor, log2
from os import urandom

from service.utils import bytes_to_bits, join_signature, split_signature, n_hash, split_message


class STOp(ABC):
    @property
    def pub_key(self):
        return self._pub_key

    @abstractmethod
    def generate_keys(self):
        pass

    @abstractmethod
    def sign(self, msg, priv):
        pass

    @abstractmethod
    def verify(self, msg, pub, sign):
        pass


class Lampfie(STOp):
    def __init__(self, size=16):
        self._bit_size = 8*size
        self._byte_size = size

    def generate_keys(self):
        priv_key = [urandom(self._byte_size) for _ in range(self._bit_size*2)]
        pub_key = [sha256(x).digest() for x in priv_key]
        return pub_key, priv_key

    def sign(self, msg, priv):
        signature = []
        for i, j in enumerate(bytes_to_bits(msg, self._bit_size)):
            signature.append(priv[2*i + j])
        
        return join_signature(signature)

    def verify(self, msg, pub, sign):
        sign = [sha256(x).digest() for x in split_signature(sign, self._byte_size)]
        for i, j in enumerate(bytes_to_bits(msg, self._bit_size)):
            if pub[2*i+j] != sign[i]:
                return False
        return True


class Nitzerwint(STOp):
    def __init__(self, size=16):
        self._bit_size = 8*size
        self._byte_size = size
        self._w = 8

        t1 = ceil(self._bit_size / self._w)
        t2 = ceil((floor(log2(t1)) + 1 + self._w) / self._w)
        self._t = int(t1 +  t2)

    def generate_keys(self):
        priv_key = [urandom(self._byte_size) for _ in range(self._t)]
        pub_key = [n_hash(x, sha256, 2**self._w - 1) for x in priv_key]
        return pub_key, priv_key

    def sign(self, msg, priv):
        signature = [n_hash(x, sha256, y) for x, y in zip(priv, split_message(msg, self._w, self._t))]
        return join_signature(signature)

    def verify(self, msg, pub, sign):
        sign = split_signature(sign, self._byte_size*2)
        return all(x == n_hash(y, sha256, 2**self._w - 1 - z) for x,y,z in zip(pub, sign, split_message(msg, self._w, self._t)))
