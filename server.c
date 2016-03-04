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

char buffer[1250];


void clear_buffer() {
    int i;
    for (i = 0; i < 1250; i++) {
        buffer[i] = '\0';
    }    
}

int start_server(int PORT_NUMBER)
{

      // structs to represent the server and client
      struct sockaddr_in server_addr,client_addr;    
      
      int sock; // socket descriptor

      // 1. socket: creates a socket descriptor that you later use to make other system calls
      if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
	perror("Socket");
	exit(1);
      }
      int temp;
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
      int fd = accept(sock, (struct sockaddr *)&client_addr,(socklen_t *)&sin_size);
      printf("Server got a connection from (%s, %d)\n", inet_ntoa(client_addr.sin_addr),ntohs(client_addr.sin_port));
      
      // buffer to read data into
      char request[1024];
      
      // 5. recv: read incoming message into buffer
      int bytes_received = recv(fd,request,1024,0);
      // null-terminate the string
      request[bytes_received] = '\0';
      printf("Here comes the message:\n");
      printf("%s\n", request);

      int fdusb = open("/dev/cu.usbmodem1421", O_RDWR);
      int bytes_read;    
      if (fdusb == -1) {
          printf("We messed up\n");
          return -1;
      }
      struct termios options; // struct to hold options
      tcgetattr(fdusb, &options);  // associate with this fd
      cfsetispeed(&options, 9600); // set input baud rate
      cfsetospeed(&options, 9600); // set output baud rate
      tcsetattr(fdusb, TCSANOW, &options); // set options
      while(1) {
          if((bytes_read = read(fdusb, buffer, 1250)) != 0) {
              printf("%s", buffer);
              buffer[bytes_read] = '\0';
              break;
          }
      }
      
      // this is the message that we'll send back
      /* it actually looks like this:
        {
           "name": "cit595"
        }
      */
      char reply[200];
      sprintf(reply, "{\n\"name\": \"%s\"\n}\n", buffer);
      
      // 6. send: send the message over the socket
      // note that the second argument is a char*, and the third is the number of chars
      bytes_received =send(fd, reply, strlen(reply), 0);
      printf("%d\n", bytes_received);
      printf("Server sent message: %s\n", reply);

      // 7. close: close the socket connection
      close(fd);
      close(sock);
      printf("Server closed connection\n");
  
      return 0;
} 



int main(int argc, char *argv[])
{
  // check the number of arguments
  if (argc != 2)
    {
      printf("\nUsage: server [port_number]\n");
      exit(0);
    }

  int PORT_NUMBER = atoi(argv[1]);
  start_server(PORT_NUMBER);
}

