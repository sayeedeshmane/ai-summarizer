export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = JSON.parse(req.body);
    
    // Check if token exists in Vercel settings
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN is missing in Vercel Environment Variables" });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
    });

    const data = await response.json();
    
    // Send the AI result back to your website
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
