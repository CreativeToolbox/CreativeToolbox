const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeStoryPrompt = (content, scenes) => {
  return `Analyze the following story and its scenes. Provide a comprehensive analysis including:
1. Overall story summary
2. Main themes and motifs
3. Character development
4. Plot structure
5. Setting analysis

Story Content:
${content}

Scenes:
${scenes.map(scene => `
Scene: ${scene.title}
Location: ${scene.location}
Time: ${scene.timeOfDay}
Characters: ${scene.characters}
Description: ${scene.description}
`).join('\n')}

Please provide a detailed analysis in JSON format with the following structure:
{
  "summary": "Overall story summary",
  "themes": ["Theme 1", "Theme 2"],
  "characterAnalysis": {
    "Character1": "Analysis",
    "Character2": "Analysis"
  },
  "plotStructure": "Analysis of plot structure",
  "settingAnalysis": "Analysis of setting",
  "scenes": {
    "sceneId": {
      "summary": "Scene summary",
      "keyEvents": ["Event 1", "Event 2"],
      "characterDevelopment": "Analysis",
      "thematicElements": ["Element 1", "Element 2"]
    }
  }
}`;
};

const analyzeScenePrompt = (scene) => {
  return `Analyze the following scene in detail. Provide insights about:
1. Scene summary
2. Key events
3. Character development
4. Thematic elements
5. Setting impact

Scene Details:
Title: ${scene.title}
Location: ${scene.location}
Time: ${scene.timeOfDay}
Characters: ${scene.characters}
Description: ${scene.description}

Please provide a detailed analysis in JSON format with the following structure:
{
  "summary": "Scene summary",
  "keyEvents": ["Event 1", "Event 2"],
  "characterDevelopment": "Analysis",
  "thematicElements": ["Element 1", "Element 2"],
  "settingImpact": "Analysis of setting's impact on the scene"
}`;
};

const analyzeStory = async (content, scenes) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a literary analysis expert. Provide detailed, insightful analysis of stories and scenes."
        },
        {
          role: "user",
          content: analyzeStoryPrompt(content, scenes)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing story:', error);
    throw new Error('Failed to analyze story');
  }
};

const analyzeScene = async (scene) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a literary analysis expert. Provide detailed, insightful analysis of scenes."
        },
        {
          role: "user",
          content: analyzeScenePrompt(scene)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing scene:', error);
    throw new Error('Failed to analyze scene');
  }
};

module.exports = {
  analyzeStory,
  analyzeScene
}; 