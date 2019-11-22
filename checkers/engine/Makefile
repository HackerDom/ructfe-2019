CC=g++
CFLAGS=-std=c++17 -Wall
CSTRIP=-s
SECFLAGS=-fno-stack-protector

SOURCE=src/generator.cpp
OUTPUT=generator

LIBS=-lboost_serialization -lboost_iostreams


.PHONY: all clean


all: 
	$(CC) $(CFLAGS) $(CSTRIP) $(SECFLAGS) $(SOURCE) -o $(OUTPUT) $(LIBS)

clean:
	rm -f generator
