import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HFService } from '../services/hfService';
import bcrypt from 'bcrypt';

export class AIController {
  static async studentChat(req: Request, res: Response) {
    try {
      const { message, history } = req.body;
      const user = (req as any).user;

      // Fetch context: all published courses to tell the student what's available
      const courses = await prisma.subjects.findMany({
        where: { is_published: true },
        select: { title: true, headline: true, price: true }
      });

      const courseContext = courses.map(c => `- ${c.title}: ${c.headline} (Price: ${c.price})`).join('\n');

      const systemPrompt = `You are a helpful AI learning assistant for the LMSPro platform. 
Current User: ${user.name}
Available Courses on the platform:
${courseContext}

Instructions:
- Help students with their doubts.
- Suggest courses from the list above if they ask.
- Be encouraging and concise.
- If they ask about something not on the platform, answer generally but mention the platform's courses if relevant.`;

      const aiResponse = await HFService.chat(message, systemPrompt);
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Student AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  }

  static async studentSuggestions(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // Fetch user's enrolled courses to suggest new ones
      const enrollments = await prisma.enrollments.findMany({
        where: { user_id: BigInt(user.userId) },
        include: { subjects: { select: { title: true } } }
      });

      const enrolledTitles = enrollments
        .filter(e => e.subjects)
        .map(e => e.subjects!.title);
      
      const allCourses = await prisma.subjects.findMany({
        where: { is_published: true },
        select: { title: true, headline: true }
      });

      const prompt = `Based on my current enrollments: [${enrolledTitles.join(', ')}], what should I learn next from these available courses: [${allCourses.map(c => c.title).join(', ')}]? Give me 3 suggestions with reasons.`;
      
      const systemPrompt = "You are a curriculum advisor. Provide personalized course suggestions.";
      const aiResponse = await HFService.chat(prompt, systemPrompt);
      
      res.json({ suggestions: aiResponse });
    } catch (error) {
      console.error("Student Suggestions Error:", error);
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  }

  static async adminAssist(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      
      // 1. Fetch Context for the AI
      const students = await prisma.users.findMany({ 
        where: { role: 'student' },
        select: { id: true, name: true, email: true }
      });
      const courses = await prisma.subjects.findMany({
        select: { id: true, title: true, slug: true, price: true }
      });

      const context = `
Current Students (ID, Name, Email):
${students.map(s => `- ${s.id}: ${s.name} (${s.email})`).join('\n')}

Current Courses (ID, Title, Slug, Price):
${courses.map(c => `- ${c.id}: ${c.title} (${c.slug}, Price: ${c.price})`).join('\n')}
`;

      const systemPrompt = `You are a Real-time Admin Assistant for LMSPro. 
You have direct access to the database via specific "Actions".

Your job is to:
1. Interpret the admin's request.
2. If the request requires a database action, return a JSON object ONLY.
3. If the request is for information, reply normally.

AVAILABLE ACTIONS (JSON format):
- {"action": "create_course", "data": {"title": string, "slug": string, "headline": string, "description": string, "price": number}}
- {"action": "update_course", "id": string, "data": {title?, slug?, headline?, description?, price?, is_published?: boolean}}
- {"action": "delete_course", "id": string}
- {"action": "create_user", "data": {"name": string, "email": string, "password": string, "role": "student" | "admin"}}
- {"action": "update_user", "id": string, "data": {name?, email?, role?}}
- {"action": "delete_user", "id": string}

IMPORTANT:
- Use IDs provided in the context below. 
- For "create_course", ensure the slug is unique and URL-friendly.
- For "create_user", use a default password like "LMS123" if not specified.
- ONLY return JSON if performing an action. Do not include markdown blocks or extra text if returning JSON.

CONTEXT:
${context}`;

      const aiResponse = await HFService.chat(prompt, systemPrompt);
      
      // 2. Parse and Execute Action
      if (aiResponse.trim().startsWith('{') && aiResponse.trim().endsWith('}')) {
        try {
          const result = JSON.parse(aiResponse);
          const { action, id, data } = result;

          let executionResult: any = null;

          switch (action) {
            case 'create_course':
              executionResult = await prisma.subjects.create({
                data: { ...data, created_by: BigInt((req as any).user.userId) }
              });
              break;
            case 'update_course':
              executionResult = await prisma.subjects.update({
                where: { id: BigInt(id) },
                data
              });
              break;
            case 'delete_course':
              await prisma.subjects.delete({ where: { id: BigInt(id) } });
              executionResult = { message: `Course ${id} deleted` };
              break;
            case 'create_user':
              const hashedPassword = await bcrypt.hash(data.password || 'LMS123', 10);
              executionResult = await prisma.users.create({
                data: { ...data, password_hash: hashedPassword }
              });
              break;
            case 'update_user':
              executionResult = await prisma.users.update({
                where: { id: BigInt(id) },
                data
              });
              break;
            case 'delete_user':
              await prisma.users.delete({ where: { id: BigInt(id) } });
              executionResult = { message: `User ${id} deleted` };
              break;
            default:
              throw new Error("Unknown action: " + action);
          }

          return res.json({ 
            response: `✅ Action '${action}' executed successfully.`,
            actionExecuted: action,
            details: executionResult 
          });

        } catch (parseError: any) {
          console.error("AI Action Execution Failed:", parseError);
          return res.json({ 
            response: "I tried to perform an action but encountered an error: " + parseError.message,
            rawAI: aiResponse 
          });
        }
      }

      // Normal response
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Admin AI Assist Error:", error);
      res.status(500).json({ error: "Failed to process admin request" });
    }
  }
}
