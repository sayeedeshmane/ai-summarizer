export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = JSON.parse(req.body);
    
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: "Server Configuration Error: Missing Token" });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        inputs: text, 
        options: { wait_for_model: true } 
      })
    });

    const data = await response.json();

    // Safety Check: If Hugging Face returns an error (like model loading or overloaded)
    if (data.error) {
      return res.status(200).json({ 
        isError: true, 
        message: "The AI is warming up. Please try again in 20 seconds." 
      });
    }

    // Success: Return the first summary in the array
    return res.status(200).json({ 
      isError: false, 
      summary: data[0].summary_text 
    });

  } catch (error) {
    return res.status(500).json({ isError: true, message: error.message });
  }
}
