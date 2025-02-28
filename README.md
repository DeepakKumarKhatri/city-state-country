# city-state-country

## API Endpoints Implemented

1. **Get All Countries (Basic Info)**
   - `GET /countries` - Returns a lightweight list of all countries with basic info

2. **Get Country Details**
   - `GET /countries/:id` - Full details for a specific country by ID
   - `GET /countries/iso/:code` - Lookup by ISO code (both ISO2 and ISO3 supported)

3. **States Endpoints**
   - `GET /countries/:id/states` - All states/provinces for a country
   - `GET /states/:id` - Details for a specific state

4. **Cities Endpoints**
   - `GET /countries/:id/cities` - All cities in a country
   - `GET /states/:id/cities` - All cities in a specific state

5. **Search and Filtering**
   - `GET /countries/search/:term` - Search countries by name
   - `GET /regions` - List all distinct regions
   - `GET /regions/:region/countries` - Get countries by region

## Monitoring & Debug
   - `GET /health` - Memory usage and uptime information