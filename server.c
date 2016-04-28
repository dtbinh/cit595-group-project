#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <fcntl.h>
#include <signal.h>
#include <termios.h>
#include <unistd.h>
#include <pthread.h>
#include "linkedlist.h"


char buffer[50];
char big_buffer[10000];
char arduino_mode;
int fdusb;
int last_motion;
int testing;
int arduino_ok;
node* head;

char* yes = "yes";
char* no = "no";

//clear the small buffer
void clear_buffer() {
    int i;
    for (i = 0; i < 20; i++) {
        buffer[i] = '\0';
    }
}

//clear the big buffer
void clear_big_buffer() {
    int i;
    for (i = 0; i < 10000; i++) {
        big_buffer[i] = '\0';
    }
}

//The thread which reads in and populates data from the sensor
void receive_data() {
    //open the usb port and set the options
    fdusb = open("/dev/cu.usbmodem1421", O_RDWR);
    //handle a missing sensor
    if (fdusb == -1) {
        printf("Unable to connect to sesnsor");
        exit(-1);
    }
    int i;
    //set the options for reading from the usb
    struct termios options; // struct to hold options
    tcgetattr(fdusb, &options);  // associate with this fd
    cfsetispeed(&options, 9600); // set input baud rate
    cfsetospeed(&options, 9600); // set output baud rate
    tcsetattr(fdusb, TCSANOW, &options); // set options
    
    //set up marker and buffers for the readings
    int temp_firstnewline, motion_firstnewline, temp_secondnewline, motion_secondnewline, mode_firstnewline;
    char temperature[50], motion[50];
    //loop and read from the arduino
    while(1) {
        int bytes_read;
        //if bytes are read, add to big buffer, and loop to see if we have a full message
        if((bytes_read = read(fdusb, buffer, 20)) > 0) {
            //set the initial state for all parsing functions
            arduino_ok = 0;
            buffer[bytes_read] = '\0';
            strcat(big_buffer, buffer);
            temp_firstnewline = -1;
            temp_secondnewline = -1;
            motion_firstnewline = -1;
            motion_secondnewline = -1;
            mode_firstnewline = -1;
            //extract the location of the temperature from the buffer
            for (i = 0; i < strlen(big_buffer); i++) {
                if (temp_firstnewline == -1 && big_buffer[i] == 'T') {
                    temp_firstnewline = i;
                } else if (temp_firstnewline >= 0 && big_buffer[i] == ';') {
                    temp_secondnewline = i;
                    break;
                }
            }
            //extract the location of the last motion time from the buffer
            for (i = 0; i < strlen(big_buffer); i++) {
                if (motion_firstnewline == -1 && big_buffer[i] == 'M') {
                    motion_firstnewline = i;
                } else if (motion_firstnewline >= 0 && big_buffer[i] == ';') {
                    motion_secondnewline = i;
                    break;
                }
            }
            //extract the location of the current temperature unit (C/F), abbreviated as S for state, from the buffer
            for (i = 0; i < strlen(big_buffer); i++) {
                if (mode_firstnewline == -1 && big_buffer[i] == 'S') {
                    arduino_mode = big_buffer[i + 2];
                    mode_firstnewline = i;
                    break;
                }
            }
            //if all fields are available, update the variables and add a node, and then clear the main buffer
            if (temp_secondnewline > 0 && motion_secondnewline > 0 && mode_firstnewline > 0) {
                big_buffer[temp_secondnewline] = '\0';
                temp_firstnewline = temp_firstnewline + 2;
                strncpy(temperature, &big_buffer[temp_firstnewline], 50);
                head = add_to_list(head, atof(temperature), arduino_mode);

                big_buffer[motion_secondnewline] = '\0';
                motion_firstnewline = motion_firstnewline + 2;
                strncpy(motion, &big_buffer[motion_firstnewline], 50);
                last_motion = atoi(motion);
                clear_big_buffer();
            }
        } else if (bytes_read == -1) {
            //if we are not reading any bytes, then the arduino is not connected, and we should flag it as such
            arduino_ok = -1;
        }
        //clear the small buffer, which has been added to the big one
        clear_buffer();
        //remove any readings that are older than an hour
        head = trim_list(head);
    }
    close(fdusb);
}

int start_server(int PORT_NUMBER)
{
    
    // structs to represent the server and client
    struct sockaddr_in server_addr,client_addr;
    
    int sock, error, temp, i; // socket descriptor
    
    // 1. socket: creates a socket descriptor that you later use to make other system calls
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        perror("Socket");
        exit(1);
    }
    if (setsockopt(sock,SOL_SOCKET,SO_REUSEADDR,&temp,sizeof(int)) == -1) {
        perror("Setsockopt");
        exit(1);
    }
    
    // configure the server
    server_addr.sin_port = htons(PORT_NUMBER); // specify port number
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    bzero(&(server_addr.sin_zero),8);
    
    // 2. bind: use the socket and associate it with the port number
    if (bind(sock, (struct sockaddr *)&server_addr, sizeof(struct sockaddr)) == -1) {
        perror("Unable to bind");
        exit(1);
    }
    
    // 3. listen: indicates that we want to listn to the port to which we bound; second arg is number of allowed connections
    if (listen(sock, 5) == -1) {
        perror("Listen");
        exit(1);
    }
    
    // once you get here, the server is set up and about to start listening
    printf("\nServer configured to listen on port %d\n", PORT_NUMBER);
    fflush(stdout);
    
    
    // 4. accept: wait here until we get a connection on that port
    int sin_size = sizeof(struct sockaddr_in);
    int fd;
    big_buffer[0] = '\0';
    pthread_t usbreader;
    error = pthread_create(&usbreader, NULL, receive_data, NULL);
    if (error != 0) {
        printf("Error in thread creation\n");
        return -1;
    }
    //create the variable to store the outside temp
    double outside_temp;
    char user_mode = 'C';
    while(1) {
        printf("Waiting...\n");
        fd = accept(sock, (struct sockaddr *)&client_addr,(socklen_t *)&sin_size);
        printf("Accepted...\n");
        printf("Server got a connection from (%s, %d)\n", inet_ntoa(client_addr.sin_addr),ntohs(client_addr.sin_port));
        
        // buffer to read data into
        char request[1024];
        
        // 5. recv: read incoming message into buffer
        int bytes_received = recv(fd,request,1024,0);
        // null-terminate the string
        request[bytes_received] = '\0';
        //display the message
        printf("Here comes the message:\n");
        printf("%s\n", request);
        
        /* Assumes a GET request. We need an if/else to differentiate between GET/POST.*/
        
        /*
         If GET
         ... same as existing code below
         Else if POST
         Parse string for API temperature
         Store API temperature variable
         Compare API temperature variable with test variable (e.g. 70 degrees F)
         Set color variable to send to Arduino:
         If API > Arduino: red
         Else if API < Arduino: blue
         Else: green
         Send to Arduino
         
         */
        
        //Handle get requests by returning a json
        if (request[0] == 'G') {
            char reply[200];
            printf("%c", arduino_mode);
            char* how_is_arduino;
            //check the state of the arduino to input into the message
            if (arduino_ok == 0) {
                how_is_arduino = yes;
            } else if (arduino_ok == -1) {
                how_is_arduino = no;
            }
            //send a message in the units currently being displayed on the sensor
            sprintf(reply, "{\n \"temp\": \"%f%c\",\n \"high\": \"%f%c\",\n \"average\": \"%f%c\",\n \"low\": \"%f%c\",\n \"lastmotion\": \"%d\",\n \"arduino\": \"%s\"  }\n", get_latest(head, user_mode), user_mode, get_high(head, user_mode), user_mode, get_average(head, user_mode), user_mode, get_low(head, user_mode), user_mode, last_motion, how_is_arduino);
            
            // 6. send: send the message over the socket
            // note that the second argument is a char*, and the third is the number of chars
            bytes_received =send(fd, reply, strlen(reply), 0);
            if (bytes_received == -1) {
                printf("Error sending");
            }
            printf("%d\n", bytes_received);
            printf("Server sent message: %s\n", reply);
            
            // 7. close: close the socket connection
            close(fd);
            
        } else if (request[0] == 'P') {
            // 6. send: send the message over the socket
            // note that the second argument is a char*, and the third is the number of chars
            int bytes_wrote = 0;
            char* start_point;
            //if the user requests a standby, send the change in state command to the arduino
            if (strstr(request, "STANDBY") != NULL) {
                printf("Found a standby!");
                bytes_wrote = write(fdusb, "M", 2);
            //if the user requests a conversion of units on the 7-SEG, send the change in unit command to the arduino
            } else if (strstr(request, "CONVERT") != NULL) {
                bytes_wrote = write(fdusb, "T", 2);
            //if the user requests a conversion of units on the UI, switch the mode. 
            } else if (strstr(request, "CHANGEUI")) {
                if (user_mode == 'C') {
                    user_mode = 'F';
                } else if (user_mode == 'F') {
                    user_mode = 'C';
                }
            //if the user sends a update temperature, parse the temp, set it in the function, and then
            //set the color of the LED appropriately
            } else if ((start_point = strstr(request, "OUTSIDE TEMP")) != NULL && testing == 0) {
                char latest_temp[10] = "";
                for (int i = 0; i < strlen(start_point); i++) {
                    if (start_point[i] <= '9' && start_point[i] >= '0') {
                        strncpy(latest_temp, &start_point[i], 10);
                        outside_temp = atof(latest_temp);
                        double last_read_temp = get_latest(head, 'C');
                        char difference[5];
                        if (outside_temp - last_read_temp > 2) {
                            difference[0] = 'H';
                        } else if (outside_temp - last_read_temp < -2) {
                            difference[0] = 'C';
                        } else {
                            difference[0] = 'N';
                        }
                        difference[1] = '\0';
                        bytes_wrote = write(fdusb, difference, strlen(difference));
                        break;
                    }
                }
                printf("Outside temp message!");
                //same as above, but with user input for testing purposes
            } else if ((start_point = strstr(request, "OUTSIDE TEMP")) != NULL && testing == 1) {
                char difference[5];
                double last_read_temp = get_latest(head, 'C');
                float fake_temp;
                scanf("%f", &fake_temp);
                if (fake_temp - last_read_temp > 2) {
                    difference[0] = 'H';
                } else if (fake_temp - last_read_temp < -2) {
                    difference[0] = 'C';
                } else {
                    difference[0] = 'N';
                }
                difference[1] = '\0';
                bytes_wrote = write(fdusb, difference, strlen(difference));
            }
            
            printf("%d\n", bytes_wrote);
            // 7. close: close the socket connection
            bytes_received =send(fd, request, strlen(request), 0);
            close(fd);
        }
    }
    //join with the usbreading thread
    error = pthread_join(usbreader, NULL);
    if (error != 0) {
        printf("Error in thread join\n");
        return -1;
    }
    //close the socket
    close(sock);
    printf("Server closed connection\n");
    
    return 0;
}



int main(int argc, char *argv[])
{
    arduino_mode = 'C';
    // check the number of arguments
    if (argc != 2 && argc != 3)
    {
        printf("\nUsage: server [port_number]\n");
        exit(0);
    }
    
    //check whether to start in testing mode
    if (argc == 2) {
        testing = 0;
    } else if (argc == 3) {
        testing = 1;
    }
    
    int PORT_NUMBER = atoi(argv[1]);
    head = NULL;
    start_server(PORT_NUMBER);
}

