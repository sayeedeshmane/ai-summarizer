export default async function handler(req, res) {
  try {
    // 1. Handle the input safely
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const text = body.text;

    if (!text) {
      return res.status(400).json({ isError: true, message: "No text provided" });
    }

    // 2. Check the token
    const token = process.env.HF_TOKEN;
    if (!token) {
      return res.status(500).json({ isError: true, message: "Server configuration: Token missing" });
    }

    // 3. Call Hugging Face
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        inputs: text, 
        options: { wait_for_model: true } 
      })
    });

    const data = await response.json();

    // 4. Return the result safely
    if (response.ok && data[0] && data[0].summary_text) {
      return res.status(200).json({ isError: false, summary: data[0].summary_text });
    } else {
      const errorMsg = data.error || "The AI model is busy. Try again in 30s.";
      return res.status(200).json({ isError: true, message: errorMsg });
    }

  } catch (error) {
    console.error("API Crash:", error);
    return res.status(500).json({ isError: true, message: "Internal Server Error" });
  }
}
