# /api/monitoring

## GET /api/monitoring

Get monitoring data. The application provides a collection of monitoring data which may be useful to clients/managers.

**Request Headers:**

- Accept: application/json

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

- lag: The nodejs event loop lag i.e. the time long requests wait in node's event queue to be processed

**Status Codes:**

- 200 OK

**Request:**

    GET /api/monitoring
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK
    {
        "lag": 134
    }
