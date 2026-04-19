export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        inputs: body.text, 
        options: { wait_for_model: true } 
      })
    });

    // CHECK IF THE RESPONSE IS ACTUALLY JSON
    const contentType = hfResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await hfResponse.text();
      console.error("Hugging Face sent HTML instead of JSON:", textError);
      return res.status(500).json({ isError: true, message: "Hugging Face is currently overloaded or the token is invalid." });
    }

    const data = await hfResponse.json();

    if (hfResponse.ok && data[0]) {
      return res.status(200).json({ isError: false, summary: data[0].summary_text });
    } else {
      return res.status(500).json({ isError: true, message: data.error || "Model busy" });
    }

  } catch (error) {
    console.error("Server Crash Log:", error);
    return res.status(500).json({ isError: true, message: "Internal Server Error" });
  }
}
