require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let chatHistory = [];


app.get('/api/messages', (req, res) => { // get all message.
  res.json({ messages: chatHistory });
});

app.post('/api/chat', async (req, res) => {// send message and get AI response
  try {
    const { message } = req.body;
    
    const userMsg = { // Save user message
      role: 'user',
      text: message,
      time: new Date().toLocaleTimeString()
    };
    chatHistory.push(userMsg);

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', { // call Groq API
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await aiResponse.json();
    
    let aiText = 'Sorry, I could not generate a response.'; // check is response is valid.
    if (data.choices && data.choices[0] && data.choices[0].message) {
      aiText = data.choices[0].message.content;
    } else {
      console.error('API Response:', data);
    }

    const aiMsg = { // save AI response
      role: 'assistant',
      text: aiText,
      time: new Date().toLocaleTimeString()
    };
    chatHistory.push(aiMsg);

    res.json({ success: true, aiMessage: aiMsg });
  } catch (error) {
    console.error('Error:', error);
    
    const errorMsg = { //still save an error message to chat
      role: 'assistant',
      text: 'Error: Could not connect to AI service.',
      time: new Date().toLocaleTimeString()
    };
    chatHistory.push(errorMsg);
    
    res.json({ success: true, aiMessage: errorMsg });
  }
});

// Clear chat
app.delete('/api/messages', (req, res) => {
  chatHistory = [];
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});