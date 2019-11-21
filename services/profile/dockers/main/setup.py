import os
import re

from setuptools import find_packages, setup


install_requires = [
    'Flask',
    'gunicorn',
    'redis',
    'requests'
]

setup(
    name='main',
    version=1,
    description='main',
    platforms=['POSIX'],
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    zip_safe=False,
)