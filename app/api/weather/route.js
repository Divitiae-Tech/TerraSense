// app/api/weather/route.js

/**
 * Handles GET requests to the weather API endpoint.
 * Fetches weather data from Meteosource and transforms it into a format
 * suitable for the client-side component.
 */
export async function GET() {
  try {
    const lat = '-26.2041'; // Johannesburg coordinates
    const lon = '28.0473';

    // Check if the API key environment variable is set
    if (!process.env.METEOSOURCE_API_KEY) {
      console.error('METEOSOURCE_API_KEY environment variable is not set');
      return Response.json({
        error: 'API configuration error',
        details: 'Weather API key not configured'
      }, { status: 500 });
    }

    const apiUrl = `https://www.meteosource.com/api/v1/free/point` +
      `?lat=${lat}` +
      `&lon=${lon}` +
      `&sections=current,daily` +
      `&timezone=Africa/Johannesburg` +
      `&language=en` +
      `&units=metric` +
      `&key=${process.env.METEOSOURCE_API_KEY}`;
      
    console.log('Calling Meteosource API...');
    console.log('API URL (without key):', apiUrl.replace(process.env.METEOSOURCE_API_KEY, '[API_KEY]'));

    const response = await fetch(apiUrl, {
      headers: { 'Accept-Encoding': 'gzip' }
    });

    console.log('Meteosource API Response Status:', response.status);
    console.log('Meteosource API Response OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Meteosource API Error:', errorData);
      return Response.json({
        error: errorData.detail || errorData.message || 'Error fetching weather data',
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Log the full raw data from the API for debugging
    console.log('Full Raw API Response:', JSON.stringify(data, null, 2));
    
    // Validate API response structure
    if (!data.current || !data.daily || !data.daily.data) {
      console.error('Invalid API response structure:', data);
      return Response.json({
        error: 'Invalid weather data structure received from API'
      }, { status: 500 });
    }
    
    // Transform the data to match your component's expected format
    const transformedWeather = {
      current: {
        temp: Math.round(data.current.temperature),
        condition: mapConditionToString(data.current.summary),
        humidity: data.current.humidity,
        wind: Math.round(data.current.wind.speed)
      },
      forecast: data.daily.data.slice(0, 7).map((day, index) => {
        // Log each day's data before processing
        console.log(`Processing forecast for day ${index}:`, day.all_day.summary);

        return {
          day: index === 0 ? 'Today' : 
               index === 1 ? 'Tomorrow' : 
               new Date(day.day).toLocaleDateString('en-US', { weekday: 'long' }),
          temp: Math.round((day.all_day.temperature_max + day.all_day.temperature_min) / 2),
          // Add a safety check before calling the mapping functions
          condition: mapConditionToIcon(day.all_day.summary),
          rain: Math.round(day.all_day.precipitation.total || 0)
        };
      })
    };

    console.log('Transformed weather data:', transformedWeather);
    return Response.json(transformedWeather);
  } catch (error) {
    console.error('Weather API Handler Error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * Helper function to map weather conditions to a component's expected string format.
 * Includes a safety check for the 'summary' parameter.
 */
function mapConditionToString(summary) {
  console.log('mapConditionToString input:', summary);
  // Safely check if summary is a string before calling toLowerCase
  if (typeof summary !== 'string') {
    return 'Partly Cloudy'; // Default condition if summary is missing or invalid
  }
  const condition = summary.toLowerCase();
  if (condition.includes('sun') || condition.includes('clear')) return 'Sunny';
  if (condition.includes('cloud')) return 'Cloudy';
  if (condition.includes('rain') || condition.includes('shower')) return 'Rainy';
  if (condition.includes('storm')) return 'Stormy';
  if (condition.includes('snow')) return 'Snowy';
  if (condition.includes('fog') || condition.includes('mist')) return 'Foggy';
  return 'Partly Cloudy';
}

/**
 * Helper function to map weather conditions to a component's expected icon type.
 * Includes a safety check for the 'summary' parameter.
 */
function mapConditionToIcon(summary) {
  console.log('mapConditionToIcon input:', summary);
  // Safely check if summary is a string before calling toLowerCase
  if (typeof summary !== 'string') {
    return 'cloudy'; // Default icon if summary is missing or invalid
  }
  const condition = summary.toLowerCase();
  if (condition.includes('sun') || condition.includes('clear')) return 'sunny';
  if (condition.includes('cloud')) return 'cloudy';
  if (condition.includes('rain') || condition.includes('shower')) return 'rainy';
  if (condition.includes('storm')) return 'rainy';
  if (condition.includes('snow')) return 'cloudy'; // or add 'snowy' if you have that icon
  if (condition.includes('fog') || condition.includes('mist')) return 'cloudy';
  return 'cloudy';
}
