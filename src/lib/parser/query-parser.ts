import { ParsedIntent } from '@/types';

/**
 * A simple deterministic query parser to extract entities for educational content.
 */
export function parseQuery(query: string): ParsedIntent {
  const q = query.toLowerCase();
  const intent: ParsedIntent = {};

  // Extract Organization/Channel
  if (q.includes('pw') || q.includes('physics wallah') || q.includes('alakh pandey')) intent.organization = 'PW';
  if (q.includes('unacademy')) intent.organization = 'Unacademy';
  if (q.includes('vedantu')) intent.organization = 'Vedantu';

  // Extract Series/Batch
  if (q.includes('manzil')) intent.series = 'Manzil';
  if (q.includes('lakshya')) intent.series = 'Lakshya';
  if (q.includes('arjuna')) intent.series = 'Arjuna';
  if (q.includes('yakeen')) intent.series = 'Yakeen';
  if (q.includes('bounce back')) intent.series = 'Bounce Back';

  // Extract Class
  if (q.match(/\b(class\s*11|11th)\b/)) intent.class = 'Class 11';
  if (q.match(/\b(class\s*12|12th)\b/)) intent.class = 'Class 12';
  if (q.match(/\b(class\s*10|10th)\b/)) intent.class = 'Class 10';

  // Extract Year
  const yearMatch = q.match(/\b(202[0-9])\b/);
  if (yearMatch) intent.year = yearMatch[1];

  // Extract Subject
  if (q.match(/\b(physics)\b/)) intent.subject = 'Physics';
  if (q.match(/\b(chemistry|chem)\b/)) intent.subject = 'Chemistry';
  if (q.match(/\b(maths|math|mathematics)\b/)) intent.subject = 'Maths';
  if (q.match(/\b(biology|bio)\b/)) intent.subject = 'Biology';

  // Extract Topic (heuristic based on remaining words)
  // This is a naive topic extractor, works for well-known acronyms or left-over keywords.
  if (q.match(/\b(goc)\b/)) intent.topic = 'General Organic Chemistry';
  if (q.match(/\b(nlm)\b/)) intent.topic = 'Newton\'s Laws of Motion';
  if (q.match(/\b(ray optics)\b/)) intent.topic = 'Ray Optics';
  if (q.match(/\b(current electricity)\b/)) intent.topic = 'Current Electricity';
  if (q.match(/\b(integration)\b/)) intent.topic = 'Integration';

  // Extract Exam
  if (q.match(/\b(jee)\b/)) intent.exam = 'JEE';
  if (q.match(/\b(neet)\b/)) intent.exam = 'NEET';
  if (q.match(/\b(boards|cbse)\b/)) intent.exam = 'Boards';

  // Extract Content Type
  if (q.match(/\b(one\s*shot)\b/)) intent.contentType = 'One Shot';
  if (q.match(/\b(pyq|pyqs)\b/)) intent.contentType = 'PYQ';
  if (q.match(/\b(revision)\b/)) intent.contentType = 'Revision';
  if (q.match(/\b(tutorial|crash course)\b/)) intent.contentType = 'Tutorial';

  return intent;
}
