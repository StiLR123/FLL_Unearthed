const WIFI_SSID = "EP-WIFI"
const WIFI_PASS = "1234@#!5678"
const THINGSPEAK_WRITE_KEY = "UW742ETAKQ4G37A9"

let logging = false
let uploadIntervalMs = 60000 // upload once per minute

// set log columns
datalogger.setColumnTitles("timestamp", "temperature", "humidity", "pressure")

datalogger.onLogFull(function () {
    logging = false
    basic.showIcon(IconNames.Skull)
})

// connect wifi
ESP8266ThingSpeak.connectWifi(
    SerialPin.P8,
    SerialPin.P12,
    BaudRate.BaudRate9600,
    WIFI_SSID,
    WIFI_PASS
)
basic.showString("WIFI")
ESP8266ThingSpeak.wait(3000)

// start/stop logging
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
    datalogger.setColumnTitles("timestamp", "temperature", "humidity", "pressure")
})

// read sensor every 200 ms
loops.everyInterval(200, function () {
    if (logging) {
        let temp = Environment.octopus_BME280(Environment.BME280_state.BME280_temperature_C)
        let hum = Environment.octopus_BME280(Environment.BME280_state.BME280_humidity)
        let pressure = Environment.octopus_BME280(Environment.BME280_state.BME280_pressure)

        // log values
        datalogger.log(
            datalogger.createCV("timestamp", input.runningTime()),
            datalogger.createCV("temperature", temp),
            datalogger.createCV("humidity", hum),
            datalogger.createCV("pressure", pressure)
        )

    }
})

// upload to ThingSpeak
loops.everyInterval(uploadIntervalMs, function () {
    if (logging) {
        let temp = Environment.octopus_BME280(Environment.BME280_state.BME280_temperature_C)
        let hum = Environment.octopus_BME280(Environment.BME280_state.BME280_humidity)
        let pressure = Environment.octopus_BME280(Environment.BME280_state.BME280_pressure)

        ESP8266ThingSpeak.connectThingSpeak(
            "api.thingspeak.com",
            THINGSPEAK_WRITE_KEY,
            temp,       // field1 = temperature
            hum,        // field2 = humidity
            pressure,   // field3 = pressure
            0, 0, 0, 0, 0
        )
        ESP8266ThingSpeak.wait(5000)
    }
})

basic.pause(1000)
basic.showIcon(IconNames.Happy)
