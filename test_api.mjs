async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: "test",
        sajuJson: { test: "test" }
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}
test();
