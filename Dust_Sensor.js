// IT TOOK ME THE WHOLE EVENING TRYING TO LEARN JAVASCRIPT AND DO THIS (because the blocks were dumb and too confusing) SO PLEASE APPRECIATE THIS EVEN THOUGH IT IS JUST THE DUST SENSOR

// At my house, SSID is "EP-WIFI" and PASS is "1234@#!5678"
// Key is "SR13MH6FXNLXZY76"
// Dust sensor vLED on P13, VO on P1
// baud rate is 115200 (no idea what that is tbh)

const WIFI_SSID = "SSID"
const WIFI_PASS = "PASSWORD"
const THINGSPEAK_WRITE_KEY = "SR13MH6FXNLXZY76"

let logging = false
let uploadIntervalMs = 60000
datalogger.setColumnTitles("timestamp", "dust")

datalogger.onLogFull(function () {
    logging = false
    basic.showIcon(IconNames.Skull)
})


ESP8266ThingSpeak.connectWifi(SerialPin.P8, SerialPin.P12, BaudRate.BaudRate115200, WIFI_SSID, WIFI_PASS)
basic.showString("WIFI")
ESP8266ThingSpeak.wait(3000)

// start log
input.onButtonPressed(Button.A, function () {
    logging = !(logging)
    if (logging) {
        basic.showIcon(IconNames.Yes)
    } else {
        basic.clearScreen()
    }
})

// delete log
input.onButtonPressed(Button.AB, function () {
    if (input.logoIsPressed()) {
        basic.showIcon(IconNames.No)
        datalogger.deleteLog()
    }
    logging = false
    datalogger.setColumnTitles("timestamp", "dust")
})

loops.everyInterval(200, function () {
    if (logging) {
        let dust = Environment.ReadDust(DigitalPin.P13, AnalogPin.P1)
        datalogger.log(
            datalogger.createCV("timestamp", input.runningTime()),
            datalogger.createCV("dust", dust)
        )
    }
})

loops.everyInterval(uploadIntervalMs, function () {
    if (logging) {
        let dustVal = Environment.ReadDust(DigitalPin.P13, AnalogPin.P1)
        // send to field1
        ESP8266ThingSpeak.connectThingSpeak("api.thingspeak.com", THINGSPEAK_WRITE_KEY, dustVal, 0, 0, 0, 0, 0, 0, 0)
        ESP8266ThingSpeak.wait(5000)
    }
})

basic.pause(1000)
basic.showIcon(IconNames.Happy)

// show dust value on LED later
