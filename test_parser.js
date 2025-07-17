const { parsePolicyQuestion } = require('./polmatrix-backend/backend/services/parser');

// Test various questions
const questions = [
  "What happens to GDP, education quality, CO₂ emissions, and public health if the U.S. invests heavily in green jobs, increases STEM education funding, and boosts Medicaid coverage through 2035?",
  "Show me trends from 2020 to 2030",
  "What will happen in the next 10 years?",
  "Analyze data since 2015",
  "Forecast until 2040"
];

questions.forEach(question => {
  console.log(`\nQuestion: ${question}`);
  console.log('Parsed result:', JSON.stringify(parsePolicyQuestion(question), null, 2));
});
