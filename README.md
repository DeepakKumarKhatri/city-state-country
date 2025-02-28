# City-State-Country API

A REST API providing global geographical data for countries, states, and cities. Freely hosted on Vercel and open for contributions.

## 🌟 Features

- Worldwide geographical data coverage
- Lightweight, fast responses
- Consistent RESTful interface
- No authentication required
- CORS-enabled for browser applications

## 📚 API Documentation

### Countries

| Endpoint | Description |
|----------|-------------|
| `GET /countries` | Retrieve a lightweight list of all countries with basic information |
| `GET /countries/:id` | Get full details for a specific country by ID |
| `GET /countries/iso/:code` | Look up a country by ISO code (both ISO2 and ISO3 supported) |
| `GET /countries/search/:term` | Search countries by name |

### States/Provinces

| Endpoint | Description |
|----------|-------------|
| `GET /countries/:id/states` | Get all states/provinces for a specific country |
| `GET /states/:id` | Get details for a specific state by ID |

### Cities

| Endpoint | Description |
|----------|-------------|
| `GET /countries/:id/cities` | Get all cities in a specific country |
| `GET /states/:id/cities` | Get all cities in a specific state |

### Regions

| Endpoint | Description |
|----------|-------------|
| `GET /regions` | List all distinct geographical regions |
| `GET /regions/:region/countries` | Get all countries in a specific region |

### Monitoring

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Get server health, memory usage, and uptime information |

## Getting Started

### Base URL
```
https://city-state-country.vercel.app
```

### Example Usage

Fetch all countries:
```bash
curl https://city-state-country.vercel.app/countries
```

Search for countries containing "united":
```bash
curl https://city-state-country.vercel.app/countries/search/united
```

Get states in the United States (assuming ID is 233):
```bash
curl https://city-state-country.vercel.app/countries/233/states
```

## 💻 Development

### Running Locally

1. Clone the repository
```bash
git clone https://github.com/DeepakKumarKhatri/city-state-country
cd city-state-country
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-source and available under the [OBbL](LICENSE).

## 🙏 Credits

This repository uses the dataset from [countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database), available under the Open Database License (ODbL).

Special thanks to all open source contributors for creating and curating this data in a useful and accessible format.

---

⭐ If you find this API useful, please consider giving it a star on GitHub!