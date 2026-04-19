export default async function handler(req, res) {
  const { text } = JSON.parse(req.body);

  const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
  });

  const data = await response.json();
  res.status(200).json(data);
}