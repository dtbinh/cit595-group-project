CC = clang

all: clean server

server: server.c
	$(CC) server.c -o server.o

clean:
	rm -rf  *.o *.out