const { calculateHighPrecisionSaju } = require('./src/lib/saju_calculator_js'); // Using the JS version for reliability

// 1990-04-26 19:40 Gwangmyeong (approx 126.83, 37.47)
const testCase = {
  year: 1990, month: 4, day: 26, hour: 19, minute: 40,
  latitude: 37.47, longitude: 126.83,
  isLunar: false, gender: "M"
};

// ... (logic from saju_calculator.ts but in JS)
// To be safe, I'll just use the verify.js structure and update the params.
