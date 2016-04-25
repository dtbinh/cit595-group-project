#include "string.h"
#include  <stdio.h>
#include <stdlib.h>

typedef struct temp_node {
	int addtime;	//the time it was added
	double temp_c;	//the temperature in celcius
    double temp_f;	//the temperature in celcius
	struct temp_node *next;  // pointer to next node
} node ;

// function declarations
node* add_to_list (node* head_node, double temp, char mode);
double get_high(node* head_node, char mode);
double get_latest(node* head_node, char mode);
double get_low(node* head_node, char mode);
double get_average(node* head_node, char mode);
node* trim_list(node* head_node);
void print_list(node* head_node);
node* delete_list(node* head_node);

//adds a node to the end of the list if it has 
//not appeared yet, or increments the count
//if it has appear
node* add_to_list (node* head_node, double temp, char mode) {
	node* current;
	node* new_node;
	//if no hashtag was provided, do nothing and return the old head
	if (head_node == NULL) {
		//if there is no head yet, make the new hashtag the head
		new_node = malloc(sizeof(node));
		//check for any leaks in memory
		if (new_node == NULL) {
			return NULL;
		}
		//set the fields
		new_node->next = NULL;
        if (mode == 'C') {
            new_node->temp_c = temp;
            new_node->temp_f = temp*1.8 + 32;
        } else {
            new_node->temp_f = temp;
            new_node->temp_c = (temp-32)/1.8;
        }
		
		new_node->addtime = time(NULL);
		return new_node;
	} else {
		current = head_node;
		while (current->next) {
			current = current->next;
		}
		new_node = malloc(sizeof(node));
		if (new_node == NULL) {
			return NULL;
		}
		current->next = new_node;
		new_node->next = NULL;
        if (mode == 'C') {
            new_node->temp_c = temp;
            new_node->temp_f = temp*1.8 + 32;
        } else {
            new_node->temp_f = temp;
            new_node->temp_c = (temp-32)/1.8;
        }
		new_node->addtime = time(NULL);
		return head_node;
	}
}

double get_latest(node* head_node, char mode) {
    //return null for an empty list
    if (head_node == NULL) {
        return -1000;
    }
    //set up variables
    node* current = head_node;
    
    //loop through 10 times, each time finding a new max (that is, the max not already
    //in the top_ten list)
    current = head_node;
    while (current->next) {
        current = current->next;
    }
    if (mode == 'C') {
        return current->temp_c;
    } else {
        return current->temp_f;
    }
}


//retrieve the top ten nodes by highest count
double get_high(node* head_node, char mode) {
	//return null for an empty list
	if (head_node == NULL) {
		return -1000;
	}
	//set up variables
	node* current = head_node;
	double max = 0;

	//loop through 10 times, each time finding a new max (that is, the max not already
	//in the top_ten list)
	current = head_node;
	max = 0;
	while (current) {
        if (mode == 'C') {
            if (max < current->temp_c) {
                max = current->temp_c;
            }
        } else {
            if (max < current->temp_f) {
                max = current->temp_f;
            }
        }
		
		current = current->next;
	}
	return max;
}

double get_low(node* head_node, char mode) {
	//return null for an empty list
	if (head_node == NULL) {
		return -1000;
	}
	//set up variables
	node* current = head_node;
	char current_top[150];
	double min = 1000;

	//loop through 10 times, each time finding a new max (that is, the max not already
	//in the top_ten list)
	current = head_node;
	while (current) {
        if (mode == 'C') {
            if (min > current->temp_c) {
                min = current->temp_c;
            }
        } else {
            if (min > current->temp_f) {
                min = current->temp_f;
            }
        }
		current = current->next;
	}
	return min;
}

double get_average(node* head_node, char mode) {
	//return null for an empty list
	if (head_node == NULL) {
		return -1000;
	}
	//set up variables
	node* current = head_node;
	char current_top[150];
	double total = 0;
	int count = 0;

	//loop through 10 times, each time finding a new max (that is, the max not already
	//in the top_ten list)
	current = head_node;
	while (current) {
        if (mode == 'C') {
            total += current->temp_c;
        } else {
            total += current->temp_f;
        }
		count++;
		current = current->next;
	}
	return total/count;
}

node* trim_list(node* head_node) {
	//return null for an empty list
	if (head_node == NULL) {
		return NULL;
	}
	//set up variables
	int current_time = time(NULL);
	if (head_node == NULL) {
		return NULL;
	}
	while((current_time - head_node->addtime) > 10) {
		node* current = head_node->next;
		free(head_node);
		head_node = current;
        if (head_node == NULL) {
            return NULL;
        }
	}
	return head_node;
}


//print the list, without rankings
void print_list(node* head_node) {
	node* current = head_node;
	while (current) {
		printf("%d: %f degrees C, %f degrees F\n", current->addtime, current->temp_c, current->temp_f);
		current = current->next;
	}
}

//delete all the nodes in the list
node* delete_list(node* head_node) {
	node* next;
	if (head_node == NULL) {
		return head_node;
	} else {
		while(head_node) {
			next = head_node->next;
			free(head_node);
			head_node = next;
		}
		return head_node;
	}
}