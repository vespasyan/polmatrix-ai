export function pivotSimulationData(data: any[]): any[] {
  const usOnly = data.filter(row => row.region === "US");

  const grouped: Record<number, any> = {};

  for (const row of usOnly) {
    const year = row.year;
    if (!grouped[year]) grouped[year] = { year };
    Object.entries(row).forEach(([key, value]) => {
      if (key !== "year" && key !== "region") {
        grouped[year][key] = value;
      }
    });
  }

  return Object.values(grouped).sort((a: any, b: any) => a.year - b.year);
}

