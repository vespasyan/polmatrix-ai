// Test script to verify the complete simulation pipeline
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testSimulation() {
  console.log("🧪 Testing complete simulation pipeline...\n");

  const testQuestion = "What happens to GDP and education if we invest in green jobs through 2030?";
  
  try {
    console.log(`📤 Sending question: "${testQuestion}"`);
    
    const response = await axios.post(`${BACKEND_URL}/api/ai/simulate`, {
      text: testQuestion
    });

    const data = response.data;
    console.log(`📊 Received ${data.length} data points`);

    if (data.length > 0) {
      const sample = data[0];
      console.log("📋 Sample data point:");
      console.log(JSON.stringify(sample, null, 2));

      // Check if source field exists
      const hasSource = data.every(item => item.source);
      console.log(`✅ Source field present: ${hasSource}`);

      // Check year range
      const years = data.map(item => item.year).sort((a, b) => a - b);
      console.log(`📅 Year range: ${years[0]} - ${years[years.length - 1]}`);

      // Check data sources
      const sources = [...new Set(data.map(item => item.source))];
      console.log(`🔍 Data sources: ${sources.join(', ')}`);

      // Count by source
      sources.forEach(source => {
        const count = data.filter(item => item.source === source).length;
        console.log(`  - ${source}: ${count} points`);
      });

    } else {
      console.log("❌ No data received");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testSimulation();
