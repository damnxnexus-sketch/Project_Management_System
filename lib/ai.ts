import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('ANTHROPIC_API_KEY not set - AI features will be disabled');
}

const client = apiKey ? new Anthropic({ apiKey }) : null;

export interface AITaskGenerationResult {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
}

export async function generateTasksFromPrompt(
  prompt: string
): Promise<AITaskGenerationResult[]> {
  if (!client) {
    console.warn('AI client not initialized, returning mock tasks');
    return generateMockTasks(prompt);
  }

  try {
    const systemPrompt = `You are a project management AI assistant. Given a user's request, generate 2-4 concrete, actionable tasks.
    
Return a JSON array with objects containing: title, description, priority (low/medium/high), estimatedHours.
Each task should be specific and ready to assign to team members.
Focus on clarity and actionability.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Generate tasks for: ${prompt}`,
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      return generateMockTasks(prompt);
    }

    const tasks = JSON.parse(jsonMatch[0]) as AITaskGenerationResult[];
    return tasks.slice(0, 4); // Limit to 4 tasks
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return generateMockTasks(prompt);
  }
}

function generateMockTasks(prompt: string): AITaskGenerationResult[] {
  return [
    {
      title: `Research: ${prompt.slice(0, 30)}...`,
      description: `Conduct research and analysis for: ${prompt}`,
      priority: 'high',
      estimatedHours: 4,
    },
    {
      title: `Plan implementation`,
      description: `Create detailed implementation plan based on research findings`,
      priority: 'medium',
      estimatedHours: 2,
    },
    {
      title: `Execute & Review`,
      description: `Implement the plan and conduct quality review`,
      priority: 'high',
      estimatedHours: 6,
    },
  ];
}

export async function analyzeTaskRisk(
  taskTitle: string,
  taskDescription: string,
  dueDate?: Date
): Promise<{ isHighRisk: boolean; reason: string }> {
  if (!client) {
    return { isHighRisk: false, reason: 'AI analysis unavailable' };
  }

  try {
    const dueDateStr = dueDate ? `Due: ${dueDate.toISOString()}` : 'No due date';

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Analyze if this task has high risk of delay:
Title: ${taskTitle}
Description: ${taskDescription}
${dueDateStr}

Respond with JSON: {"isHighRisk": boolean, "reason": "brief explanation"}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error analyzing task risk:', error);
  }

  return { isHighRisk: false, reason: 'Analysis failed' };
}

export async function suggestTaskOptimizations(
  tasks: Array<{ title: string; description: string }>
): Promise<string[]> {
  if (!client) {
    return ['Consider breaking down large tasks', 'Set realistic deadlines'];
  }

  try {
    const taskList = tasks
      .map((t, i) => `${i + 1}. ${t.title}: ${t.description}`)
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Suggest 3-5 optimizations for these tasks:\n${taskList}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';
    const suggestions = responseText
      .split('\n')
      .filter((s) => s.trim().length > 0)
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Error getting task optimizations:', error);
    return [];
  }
}
