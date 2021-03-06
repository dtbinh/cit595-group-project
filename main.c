#include <pebble.h>
static Window *window;
static TextLayer *hello_layer;
static char msg[100];

/* This is called when the down button is clicked */
void down_click_handler(ClickRecognizerRef recognizer, void *context) {
    text_layer_set_text(hello_layer, "Standby!");
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    int key = 1;
    
    // send the message "standby" to the phone, using key #1
    Tuplet value = TupletCString(key, "standby");
    dict_write_tuplet(iter, &value);
    app_message_outbox_send();
}

void double_down_click_handler(ClickRecognizerRef recognizer, void *context) {
    text_layer_set_text(hello_layer, "Convert!");
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    int key = 3;
    
    // send the message "convert" to the phone, using key #3
    Tuplet value = TupletCString(key, "convert");
    dict_write_tuplet(iter, &value);
    app_message_outbox_send();
}

void double_up_click_handler(ClickRecognizerRef recognizer, void *context) {
    text_layer_set_text(hello_layer, "Change UI!");
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    int key = 4;
    
    // send the message "convert" to the phone, using key #3
    Tuplet value = TupletCString(key, "change");
    dict_write_tuplet(iter, &value);
    app_message_outbox_send();
}

/* This is called when the top button is clicked */
void up_click_handler(ClickRecognizerRef recognizer, void *context) {
    text_layer_set_text(hello_layer, "GET!");
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    int key = 2;
    
    // send the message "standby" to the phone, using key #2
    Tuplet value = TupletCString(key, "GET");
    dict_write_tuplet(iter, &value);
    app_message_outbox_send();
}


void out_sent_handler(DictionaryIterator *sent, void *context) {
    // outgoing message was delivered -- do nothing
}

void out_failed_handler(DictionaryIterator *failed,
                        AppMessageResult reason, void *context) {
    // outgoing message failed
    text_layer_set_text(hello_layer, "Error out!");
}

void in_received_handler(DictionaryIterator *received, void *context) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "MESSAGE RECEIVED");
    // incoming message received
    // looks for key #0 in the incoming message
    int key = 0;
    Tuple *text_tuple = dict_find(received, key);
    if (text_tuple) {
        if (text_tuple->value) {
            // put it in this global variable
            strcpy(msg, text_tuple->value->cstring);
        } else strcpy(msg, "no value!");
        
        text_layer_set_overflow_mode(hello_layer, GTextOverflowModeWordWrap);
        text_layer_set_text(hello_layer, msg);
        
        
    } else {
        text_layer_set_text(hello_layer, "no message!");
    }
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    // incoming message dropped
    text_layer_set_text(hello_layer, "Error in!");
}


/* This is called when the select button is clicked */
void select_click_handler(ClickRecognizerRef recognizer, void *context)
{
    
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    int key = 0;
    
    // send the message "hello?" to the phone, using key #0
    Tuplet value = TupletCString(key, "hello?");
    dict_write_tuplet(iter, &value);
    app_message_outbox_send();
    
    //text_layer_set_text(hello_layer, "Selected!");
    
}


/* this registers the appropriate function to the appropriate button */
void config_provider(void *context) {
    uint8_t min_clicks = 2;          // Fire after at least one clicks
    uint8_t max_clicks = 2;          // Don't fire after two clicks
    uint16_t timeout = 0;          // Wait 300ms before firing
    bool last_click_only = true;     // Fire only after the last click
    
    window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
    
    ButtonId id = BUTTON_ID_DOWN;  // The Down button
    window_multi_click_subscribe(id, min_clicks, max_clicks, timeout,
                                 last_click_only, double_down_click_handler);
    
    window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
    window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
    window_multi_click_subscribe(BUTTON_ID_UP, min_clicks, max_clicks, timeout,
                                 last_click_only, double_up_click_handler);
}


static void window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);
    hello_layer = text_layer_create((GRect)
                                    { .origin = { 0, 36 },
                                        .size = { bounds.size.w, 80 } });
    text_layer_set_text(hello_layer, "Use OpenWeather!");
    text_layer_set_text_alignment(hello_layer, GTextAlignmentCenter);
    layer_add_child(window_layer, text_layer_get_layer(hello_layer));
}

static void window_unload(Window *window) {
    text_layer_destroy(hello_layer);
}

static void init(void) {
    window = window_create();
    window_set_window_handlers(window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload,
    });
    // need this for adding the listener
    window_set_click_config_provider(window, config_provider);
    
    // for registering AppMessage handlers
    app_message_register_inbox_received(in_received_handler);
    app_message_register_inbox_dropped(in_dropped_handler);
    app_message_register_outbox_sent(out_sent_handler);
    app_message_register_outbox_failed(out_failed_handler);
    const uint32_t inbound_size = 128;
    const uint32_t outbound_size = 128;
    app_message_open(inbound_size, outbound_size);
    
    const bool animated = true;
    window_stack_push(window, animated);
}

static void deinit(void) {
    window_destroy(window);
}

int main(void) {
    init();
    app_event_loop();
    deinit();
}