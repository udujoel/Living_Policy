
export interface WorldBankIndicator {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit?: string;
  obs_status?: string;
  decimal?: number;
}

const INDICATORS = {
  energy_imports: 'EG.IMP.CONS.ZS', // Energy imports, net (% of energy use)
  renewable_consumption: 'EG.FEC.RNEW.ZS', // Renewable energy consumption (% of total final energy consumption)
  gdp_growth: 'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
  co2_emissions: 'EN.ATM.CO2E.PC', // CO2 emissions (metric tons per capita)
  debt_gdp: 'GC.DOD.TOTL.GD.ZS', // Central government debt, total (% of GDP)
};

export async function fetchWorldBankData(countryCode: string = 'EST') {
  const indicators = Object.entries(INDICATORS);
  const results: Record<string, { local: number | null; global: number | null }> = {};

  // Fetch both Local and World average in parallel
  // We'll limit to the most recent year available (usually last 1-3 years)
  // API format: https://api.worldbank.org/v2/country/EST;WLD/indicator/EG.IMP.CONS.ZS?source=2&mrnev=1&format=json
  
  // Note: source=2 is WDI. mrnev=1 gets the most recent non-empty value.
  
  const promises = indicators.map(async ([key, indicatorCode]) => {
    try {
      const url = `https://api.worldbank.org/v2/country/${countryCode};WLD/indicator/${indicatorCode}?source=2&mrnev=1&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${indicatorCode}`);
      
      const data = await response.json();
      // data[0] is metadata, data[1] is the array of results
      if (data && data.length > 1 && Array.isArray(data[1])) {
        const records = data[1] as WorldBankIndicator[];
        
        const localRecord = records.find(r => r.countryiso3code === countryCode || r.country.id === countryCode);
        const globalRecord = records.find(r => r.country.value === 'World' || r.countryiso3code === 'WLD');

        results[key] = {
          local: localRecord ? localRecord.value : null,
          global: globalRecord ? globalRecord.value : null
        };
      } else {
        results[key] = { local: null, global: null };
      }
    } catch (error) {
      console.error(`Error fetching WB data for ${key}:`, error);
      results[key] = { local: null, global: null };
    }
  });

  await Promise.all(promises);
  return results;
}
