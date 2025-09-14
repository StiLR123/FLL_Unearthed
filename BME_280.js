// At my house, SSID is "EP-WIFI" and PASS is "1234@#!5678"
// Key is "UW742ETAKQ4G37A9"
// BME_280 Sensor on SCL and SDA (P19 and P20)
// baud rate is 115200 (no idea what that is tbh)

const WIFI_SSID = "EP-WIFI"
const WIFI_PASS = "1234@#!5678"
const THINGSPEAK_WRITE_KEY = "UW742ETAKQ4G37A9"

let logging = false
let uploadIntervalMs = 60000 


datalogger.setColumnTitles("timestamp", "temperature", "humidity", "pressure")

datalogger.onLogFull(function () {
    logging = false
    basic.showIcon(IconNames.Skull)
})

// connect wifi
ESP8266ThingSpeak.connectWifi(
    SerialPin.P8,
    SerialPin.P12,
    BaudRate.BaudRate115200,
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
            temp, 
            hum,        
            pressure,   
            0, 0, 0, 0, 0
        )
        ESP8266ThingSpeak.wait(5000)
    }
})

basic.pause(1000)
basic.showIcon(IconNames.Happy)
