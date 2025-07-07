# IPMA Weather API Documentation

This document provides a guide to using the Portuguese Institute for Sea and Atmosphere (IPMA) open data API to retrieve weather forecasts for locations in Portugal. This can be useful for applications that need to display weather information, for example, to inform users about conditions relevant to plant life or outdoor activities.

## API Usage Flow

1.  **Find Location ID**: Use the "Get Location Identifiers" endpoint to find the `globalIdLocal` for the city or area you are interested in.
2.  **Get Forecast**: Use the "Get 5-Day Weather Forecast" endpoint, passing the `globalIdLocal` obtained in the previous step to retrieve the weather forecast.
3.  **Interpret Data**: Use the auxiliary "Code Tables" endpoints to understand the meaning of codes for weather type, wind speed, and precipitation intensity.

---

## 1. Get Location Identifiers

Before fetching a weather forecast, you need the `globalIdLocal` for the desired location. This ID is available from the `distrits-islands.json` endpoint.

- **Endpoint:** `https://api.ipma.pt/open-data/distrits-islands.json`
- **Method:** `GET`
- **Description:** Provides a list of districts, islands, and other relevant forecast locations in Portugal, along with their corresponding identifiers.

### Example Response Snippet

```json
{
  "owner": "IPMA",
  "country": "PT",
  "data": [
    {
      "idRegiao": 1,
      "idAreaAviso": "AVR",
      "idConcelho": 5,
      "globalIdLocal": 1010500,
      "latitude": "40.6413",
      "idDistrito": 1,
      "local": "Aveiro",
      "longitude": "-8.6535"
    },
    {
      "idRegiao": 1,
      "idAreaAviso": "CBO",
      "idConcelho": 2,
      "globalIdLocal": 1050200,
      "latitude": "39.8217",
      "idDistrito": 5,
      "local": "Castelo Branco",
      "longitude": "-7.4957"
    },
    {
      "idRegiao": 1,
      "idAreaAviso": "CBR",
      "idConcelho": 3,
      "globalIdLocal": 1060300,
      "latitude": "40.2081",
      "idDistrito": 6,
      "local": "Coimbra",
      "longitude": "-8.4194"
    }
  ]
}
```

### Response Fields

| Key             | Type    | Description                                                                 |
| --------------- | ------- | --------------------------------------------------------------------------- |
| `globalIdLocal` | Integer | The unique identifier for the location. Use this for the forecast endpoint. |
| `local`         | String  | The name of the location.                                                   |
| `idRegiao`      | Integer | Region ID (1: Mainland, 2: Madeira, 3: Azores).                             |
| `idDistrito`    | Integer | District ID.                                                                |
| `idConcelho`    | Integer | Municipality ID.                                                            |
| `idAreaAviso`   | String  | Warning area identifier.                                                    |
| `latitude`      | String  | Latitude in decimal degrees.                                                |
| `longitude`     | String  | Longitude in decimal degrees.                                               |

---

## 2. Get 5-Day Weather Forecast

Once you have the `globalIdLocal`, you can retrieve the 5-day weather forecast for that location.

- **Endpoint:** `https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{globalIdLocal}.json`
- **Method:** `GET`
- **URL Parameters:**
  - `{globalIdLocal}` (required): The identifier for the location (e.g., `1060300` for Coimbra).

### Example Request

```
https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1060300.json
```

### Example Response

```json
{
  "owner": "IPMA",
  "country": "PT",
  "data": [
    {
      "precipitaProb": "0.0",
      "tMin": "15.9",
      "tMax": "30.1",
      "predWindDir": "NW",
      "idWeatherType": 2,
      "classWindSpeed": 1,
      "longitude": "-8.4194",
      "forecastDate": "2025-06-27",
      "latitude": "40.2081"
    },
    {
      "precipitaProb": "40.0",
      "tMin": "19.6",
      "tMax": "38.3",
      "predWindDir": "NW",
      "idWeatherType": 6,
      "classWindSpeed": 1,
      "longitude": "-8.4194",
      "forecastDate": "2025-06-29",
      "classPrecInt": 2,
      "latitude": "40.2081"
    }
  ],
  "globalIdLocal": 1060300,
  "dataUpdate": "2025-06-27T23:31:02"
}
```

### Response Fields

| Key              | Type    | Description                                                                                           |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `forecastDate`   | String  | The date of the forecast (YYYY-MM-DD).                                                                |
| `tMin`           | String  | Minimum daily temperature in Celsius (°C).                                                            |
| `tMax`           | String  | Maximum daily temperature in Celsius (°C).                                                            |
| `precipitaProb`  | String  | Probability of precipitation (%).                                                                     |
| `predWindDir`    | String  | Predominant wind direction (N, NE, E, SE, S, SW, W, NW).                                              |
| `idWeatherType`  | Integer | Code for the weather type. See [Weather Type Codes](#31-weather-type-codes).                          |
| `classWindSpeed` | Integer | Code for wind speed class. See [Wind Speed Codes](#32-wind-speed-codes).                              |
| `classPrecInt`   | Integer | Code for precipitation intensity class. See [Precipitation Codes](#33-precipitation-intensity-codes). |
| `latitude`       | String  | Latitude of the location.                                                                             |
| `longitude`      | String  | Longitude of the location.                                                                            |
| `globalIdLocal`  | Integer | The location identifier.                                                                              |
| `dataUpdate`     | String  | The timestamp of the last data update (UTC).                                                          |

---

## 3. Code Tables (Auxiliary Services)

To interpret the codes in the forecast response, you can use the following auxiliary endpoints.

### 3.1. Weather Type Codes

- **Endpoint:** `https://api.ipma.pt/open-data/weather-type-classe.json`
- **Description:** Provides a mapping of `idWeatherType` to its description in Portuguese and English.

#### Sample Data

| `idWeatherType` | `descWeatherTypePT`            | `descWeatherTypeEN`           |
| --------------- | ------------------------------ | ----------------------------- |
| 1               | Céu limpo                      | Clear sky                     |
| 2               | Céu pouco nublado              | Partly cloudy                 |
| 3               | Céu parcialmente nublado       | Partly cloudy sky             |
| 4               | Céu muito nublado ou encoberto | Very cloudy sky               |
| 5               | Céu nublado por nuvens altas   | Sky overcast with high clouds |
| 6               | Aguaceiros                     | Showers                       |
| ...             | ...                            | ...                           |
| 27              | Aguaceiros e trovoada          | Showers and thunderstorms     |

_(Note: The table is illustrative. Refer to the endpoint for the complete list.)_

### 3.2. Wind Speed Codes

- **Endpoint:** `https://api.ipma.pt/open-data/wind-speed-daily-classe.json`
- **Description:** Provides a mapping of `classWindSpeed` to its description.

#### Sample Data

| `classWindSpeed` | `descClassWindSpeedPT` | `descClassWindSpeedEN` |
| ---------------- | ---------------------- | ---------------------- |
| 1                | Fraco                  | Weak                   |
| 2                | Moderado               | Moderate               |
| 3                | Forte                  | Strong                 |
| 4                | Muito forte            | Very strong            |

### 3.3. Precipitation Intensity Codes

- **Endpoint:** `https://api.ipma.pt/open-data/precipitation-classe.json`
- **Description:** Provides a mapping of `classPrecInt` to its description.

#### Sample Data

| `classPrecInt` | `descClassPrecIntPT` | `descClassPrecIntEN` |
| -------------- | -------------------- | -------------------- |
| 0              | Nenhuma              | None                 |
| 1              | Fraca                | Weak                 |
| 2              | Moderada             | Moderate             |
| 3              | Forte                | Strong               |

---

**Source:** [IPMA API](https://api.ipma.pt/). Copyright © IPMA 2018 | ipma.pt
