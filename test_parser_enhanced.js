// Test script to verify the simulation pipeline works correctly
const { parsePolicyQuestion } = require('./polmatrix-backend/backend/services/parser');

// Test cases for improved time parsing
const testQuestions = [
  "What happens to GDP, education quality, CO2 emissions, and public health if the U.S. invests heavily in green jobs, increases STEM education funding, and boosts Medicaid coverage through 2035?",
  "How will education spending affect economic growth over the next 10 years?",
  "What are the projected impacts from 2025 to 2030?",
  "Show me trends until 2040",
  "Analyze policy effects by 2028"
];

console.log("🧪 Testing enhanced parser...\n");

testQuestions.forEach((question, index) => {
  console.log(`Test ${index + 1}: "${question}"`);
  const parsed = parsePolicyQuestion(question);
  console.log(`  Time: ${parsed.time.startYear}-${parsed.time.endYear} (${parsed.time.periods} periods)`);
  console.log(`  Metrics: ${parsed.metrics.map(m => m.metricKey).join(', ')}`);
  console.log(`  Policies: ${parsed.policies.length} policy levers`);
  console.log('');
});

console.log("✅ Parser tests completed!");
