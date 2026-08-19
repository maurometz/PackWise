type WeatherResult = {
  available: boolean;
  location?: string;
  daily?: { date: string; min: number; max: number; rainProbability: number; code: number; label: string }[];
  message?: string;
};

const weatherLabels: Record<number, string> = { 0: 'Céu limpo', 1: 'Predominantemente limpo', 2: 'Parcialmente nublado', 3: 'Nublado', 45: 'Névoa', 48: 'Névoa congelante', 51: 'Garoa leve', 53: 'Garoa', 55: 'Garoa intensa', 61: 'Chuva leve', 63: 'Chuva', 65: 'Chuva intensa', 71: 'Neve leve', 73: 'Neve', 75: 'Neve intensa', 80: 'Pancadas leves', 81: 'Pancadas', 82: 'Pancadas intensas', 95: 'Tempestade', 96: 'Tempestade com granizo', 99: 'Tempestade forte' };

export type LocationSuggestion = { id: number; name: string; country: string; admin1?: string; latitude: number; longitude: number };

export async function searchOpenMeteoLocations(query: string): Promise<LocationSuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query.trim()); url.searchParams.set('count', '6'); url.searchParams.set('language', 'pt'); url.searchParams.set('format', 'json');
    const response = await fetch(url); const data = await response.json() as { results?: LocationSuggestion[] };
    return data.results ?? [];
  } catch { return []; }
}

export async function getOpenMeteoForecast(destination: string, startDate: Date, endDate: Date): Promise<WeatherResult> {
  try {
    const locationUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    locationUrl.searchParams.set('name', destination); locationUrl.searchParams.set('count', '1'); locationUrl.searchParams.set('language', 'pt'); locationUrl.searchParams.set('format', 'json');
    const locationResponse = await fetch(locationUrl); const locationData = await locationResponse.json() as { results?: { latitude: number; longitude: number; name: string; country: string }[] };
    const location = locationData.results?.[0];
    if (!location) return { available: false, message: 'Destino não localizado pela API meteorológica.' };
    const daysUntilStart = Math.ceil((startDate.getTime() - Date.now()) / 86_400_000);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
    if (daysUntilStart > 16 || daysUntilStart < -2 || duration > 16) return { available: false, location: `${location.name}, ${location.country}`, message: 'A previsão detalhada estará disponível até 16 dias antes da viagem.' };
    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.searchParams.set('latitude', String(location.latitude)); forecastUrl.searchParams.set('longitude', String(location.longitude)); forecastUrl.searchParams.set('daily', 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code'); forecastUrl.searchParams.set('timezone', 'auto'); forecastUrl.searchParams.set('forecast_days', '16');
    const forecastResponse = await fetch(forecastUrl); const forecast = await forecastResponse.json() as { daily?: { time: string[]; temperature_2m_min: number[]; temperature_2m_max: number[]; precipitation_probability_max: number[]; weather_code: number[] } };
    const daily = forecast.daily?.time.map((date, index) => ({ date, min: Math.round(forecast.daily!.temperature_2m_min[index]), max: Math.round(forecast.daily!.temperature_2m_max[index]), rainProbability: forecast.daily!.precipitation_probability_max[index], code: forecast.daily!.weather_code[index], label: weatherLabels[forecast.daily!.weather_code[index]] ?? 'Condição variável' })) ?? [];
    return { available: true, location: `${location.name}, ${location.country}`, daily };
  } catch { return { available: false, message: 'Não foi possível consultar a previsão agora.' }; }
}
