# Fugle Pre-test
- This project is for pre-test of Fugle.
- This project sets up a Node.js application using Docker and Docker compose to simplify set up flow.

## Prerequisites
- Ubuntu 20.04 LTS (x86_64)
- Docker 27.3.1
- Docker Compose 27.3.1


## Project Structure

Your project should have the following structure:

```
project-root/
├── Dockerfile                # Instructions for building Docker image 
├── README.md                 # This file
├── app.js                    # Entry point for application 
├── docker-compose.yml        # Docker Compose configuration
├── package-lock.json         # Locked dependency 
├── package.json              # Package settings
├── src                       # Application source code
│   ├── config
│   ├── controller
│   ├── event
│   ├── helper
│   ├── model
│   ├── route
│   └── ws-server.js
└── tests                     # Test file for source code
    └── event

```

## Getting Started

1. **Clone the repository** (if applicable):
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Build and run the application**:
   ```
   docker compose up --build
   ```

3. **Access the application**:
   - Open your web browser and navigate to `http://localhost:3000/data?user=<id>`.
   - Open your ws client (e.g. Postman) to `ws://localhost:3000/streaming`.

## Stopping the Application

To stop the application and remove the containers, use:
```
docker compose down
```
## Stream API
### Basic URL
`ws://localhost:3000/streaming?user=<id>`
- Query Params:
  - user: (interger) represent user id
### Subscribe
```json
{"action": "subscribe", "channel": "<currency pair>"}
```
- Body:
  - action: (str) must be `subscribe`
  - channel: (str) currency pair e.g. btcusd [refer to Bitstamp](https://www.bitstamp.net/websocket/v2/)
- Response:
  - success response: `{"msg":"success","code":0}`
- Note:
  - After subscribe, you'll see **Real-Time trade message** every trading and **Periodical OHLC message** every 1 min.
### Unsubscribe
```json
{"action": "unsubscribe", "channel": "<currency pair>"}
```
- Body:
  - action: (str) must be `subscribe`
  - channel: (str) currency pair e.g. btcusd [refer to Bitstamp](https://www.bitstamp.net/websocket/v2/)
- Response:
  - success response: `{"msg":"success","code":0}`

### 
### Real-Time trade message
#### Example
```json
{
    "data": {
        "id": 364205119,
        "timestamp": "1728926029",
        "amount": 0.00091476,
        "amount_str": "0.00091476",
        "price": 65593,
        "price_str": "65593",
        "type": 0,
        "microtimestamp": "1728926029331000",
        "buy_order_id": 1802612959944708,
        "sell_order_id": 1802612930998273
    },
    "channel": "btcusd", 
    "event": "trade"
}
```
- Note
    - channel: currency pair
    - event: `trade` indicate the data is real-time trading date.
### Real-Time OHLC message
#### Example
```json
{
    "channel": "btcusd",
    "data": {
        "open": 65651,
        "high": 65654,
        "low": 65638,
        "close": 65640,
        "date": "2024-17-14 17:17:00"
    },
    "events": "ohlc"
}
```
- Note
    - event: `ohlc` indicate the data is OHLC of `date`.
## Future Work
- Create test file for all components.
- Move rate limit to Lua to prevent race condition.


## License
MIT
