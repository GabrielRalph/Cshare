#include "ConfigRegsPIC18F452.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "delays.h"

/**
  main, displays a welcome message, initiates ADC, UART, menu and the LCD then
  enters a loop where the menu is displayed and when a drive mode is selected
  then the controller enters into drive mode.
*/
void main(void) {
    char ff[] =  "  hey,  David,  ";
    char ff2[] = " Avie and Yiwei ";
    TRISB = 3;


    initAdc();
    configureUART();
    initMenu();
    initLcd();
    lcdPrintRandom(ff, 0);
    lcdPrintRandom(ff2, 1);

    delay(100);
    lcdClear();

    while(1){
        lcdClear();
        mainMenu();
        drive();
    }
}

/**
  drive, when called enters a loop where the user can send joystick vectors
  to the robot to control it.
*/
void drive(){
    char testy[16];
    char rec;

    Vector vLeft;
    Vector vRight;
    Vector velocity;

    char driving = 1;
    unsigned int overflow = 0;

    while(driving){

        //Get velocity vector from joysticks
        vLeft = getJoystick('l');
        vRight = getJoystick('r');

        velocity.z = vLeft.z;
        velocity.x = vLeft.x;
        velocity.y = vRight.y;

        //If exit button pressed
        if (PORTBbits.RB1 != 0){
            velocity.x = 0;
            velocity.y = 0;
            driving = 0;
        }else{
            delay(50);

        }

        //Sanitize and transmit
        xBeeCmd.vector = sanitizeV(velocity);
        xBeeCmd.V = 'V';
        xBeeTransmitCmd();
        lcdClear();

        sprintf(testy, "%c: %4d, %c: %4d", 0b11100100, 20 + (rand() %50), 0b11100101, 20 + (rand() % 12));
        lcdPrintVector(xBeeCmd.vector, 0);
        lcdPrintString(testy, 0, 1);
    }
}
