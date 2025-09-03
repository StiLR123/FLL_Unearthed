// stop logging
datalogger.onLogFull(function () {
    logging = false
    basic.showIcon(IconNames.Skull)
})
// toggle logging with button A
input.onButtonPressed(Button.A, function () {
    logging = !(logging)
    if (logging) {
        basic.showIcon(IconNames.Yes)
    } else {
        basic.clearScreen()
    }
})
// delete log with button A+B while logo pressed
input.onButtonPressed(Button.AB, function () {
    if (input.logoIsPressed()) {
        basic.showIcon(IconNames.No)
        datalogger.deleteLog()
    }
    logging = false
    datalogger.setColumnTitles(
    "timestamp",
    "dust"
    )
})
let dust = 0
let dustVal = 0
let logging = false
let WIFI_SSID = "EP-WIFI"
let WIFI_PASS = "1234@#!5678"
let THINGSPEAK_WRITE_KEY = "SR13MH6FXNLXZY76"
let uploadIntervalMs = 6000

datalogger.setColumnTitles(
"timestamp",
"dust"
)
ESP8266ThingSpeak.connectWifi(
SerialPin.P8,
SerialPin.P12,
BaudRate.BaudRate115200,
WIFI_SSID,
WIFI_PASS
)
basic.showString("WIFI")
ESP8266ThingSpeak.wait(3000)
basic.pause(1000)
basic.showIcon(IconNames.Happy)
loops.everyInterval(uploadIntervalMs, function () {
    if (logging) {
        dustVal = Environment.ReadDust(DigitalPin.P13, AnalogPin.P1)
        // send to ThingSpeak field1
        ESP8266ThingSpeak.connectThingSpeak(
        "api.thingspeak.com",
        THINGSPEAK_WRITE_KEY,
        dustVal,
        0,
        0,
        0,
        0,
        0,
        0,
        0
        )
        ESP8266ThingSpeak.wait(5000)
    }
})
loops.everyInterval(200, function () {
    if (logging) {
        dust = Environment.ReadDust(DigitalPin.P13, AnalogPin.P1)
        datalogger.log(
        datalogger.createCV("timestamp", input.runningTime()),
        datalogger.createCV("dust", dust)
        )
    }
})

// show dust value on LED later