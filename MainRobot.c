#include <stdio.h>
#include <stdlib.h>
#include "ConfigRegsPIC18F452.h"
#include <p18f452.h>
#include <string.h>
#include "delays.h"
#include <usart.h>
#include <math.h>
#define TRUE 1
#define FALSE 0

/**
    main is the main function that is run on the robot for the barrel
    racing system that has been implemented. The function sets up the
    required configuration and then loops infinitely, acquiring strings
    from the controller with interrupts and calculating motor power from
    the encoder readings and the IR sensor values to then be output
    to the motors.
*/
void main(void){

    // Setup for USART
    configureUART();
    configureUARTInterrupts();

    motorsSetup();
    max_speed = 80;
    max_yaw = 300;
    configInit();
    mode = 1;

    // Setup for encoders
    TMR1Setup();
    PORTDSetup();
    interruptSetup();
    // End setup for encoders

    // Setup for IR timer
    TMR0Setup();
    initADC();


    for(;;){

       // Send string back to controller
        xBeeSend("SSending");
        power = vectorToMotor(velocity);// output x,y value

        userAssist();

        // Start Encoder RPM calcualtion
        // Calculate rpm from encoders
        calculateRPM();

        if(velocity.z == 1){
            mode = 1;
        }
        // Correct encoder direction
        correctEncoderDirection();

        // End encoder RPM calculations

        // Encoder PID calculation
        encoderPIDCalculation();

        // Decipher what mode system is in and set power accordingly
        if(mode)setMotors(power);
        if(!mode)setMotors(IR_power);

    }
}
