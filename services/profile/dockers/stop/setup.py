import os
import re

from setuptools import find_packages, setup


install_requires = [
    'aiohttp',
    'aioredis',
    'async-timeout<4.0,>=3.0',
    'gunicorn',
    'redis',
    'webargs'
]

setup(
    name='stop',
    version=1,
    description='stop',
    platforms=['POSIX'],
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    zip_safe=False,
)