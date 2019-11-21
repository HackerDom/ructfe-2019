import os
import re

from setuptools import find_packages, setup


install_requires = [
    'aiohttp',
    'aiojobs',
    'aioredis',
    'async-timeout<4.0,>=3.0',
    'gunicorn',
    'numpy',
    'webargs'
]

setup(
    name='lwe',
    version=1,
    description='lwe',
    platforms=['POSIX'],
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    zip_safe=False,
)