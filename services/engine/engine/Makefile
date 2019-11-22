CC=g++
CFLAGS=-std=c++17 -Wall
SECFLAGS=-Wl,-z,noexecstack -fno-stack-protector

SRCDIR=src
OUTDIR=bin

SOURCE=$(SRCDIR)/engine.cpp
OUTPUT=$(OUTDIR)/engine

LIBS=-lboost_serialization -lboost_iostreams -lboost_filesystem -lboost_system


.PHONY: all clean


all: 
	mkdir -p $(OUTDIR)
	$(CC) $(CFLAGS) $(SECFLAGS) $(SOURCE) -o $(OUTPUT) $(LIBS)

clean:
	rm -rf $(OUTDIR)
