## 📁 Project Structure
---
betacrew_exchange_server/
├── client.js # TCP client that connects to the exchange server
├── main.js # TCP server simulating the exchange
├── helper.js # Utility functions for parsing and requesting packets
├── output.json # (Optional) Output file for received data
---
## 🚀 Getting Started

### 1. Clone or Navigate to the Project Directory

```bash
cd betacrew_exchange_server
```
### 2: Start the TCP Server

```bash
node main.js
```
### 3: Run the Client in another terminal
```bash
node client.js
```
