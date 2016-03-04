#include <sys/types.h>
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>

char buffer[1250];


void clear_buffer() {
    int i;
    for (i = 0; i < 1250; i++) {
        buffer[i] = '\0';
    }    
}


int main() {
    printf("Try to open the file\n");
    int fd = open("/dev/cu.usbmodem1421", O_RDWR);
    printf("Opened file\n");
    int bytes_read;    
    if (fd == -1) {
        printf("We messed up");
        return -1;
    }
    printf("File opened\n");
    struct termios options; // struct to hold options
    tcgetattr(fd, &options);  // associate with this fd
    cfsetispeed(&options, 9600); // set input baud rate
    cfsetospeed(&options, 9600); // set output baud rate
    tcsetattr(fd, TCSANOW, &options); // set options
    while(1) {
        if((bytes_read = read(fd, buffer, 1250)) != 0) {
            printf("%s", buffer);
            clear_buffer();            
        }
    }
}