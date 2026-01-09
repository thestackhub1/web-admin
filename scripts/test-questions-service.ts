import 'dotenv/config';
import { QuestionsService } from '../src/lib/services/questions.service';

async function main() {
  console.log('Testing QuestionsService.getAll()...\n');
  
  try {
    const questions = await QuestionsService.getAll({ limit: 20 });
    console.log('Questions returned:', questions.length);
    
    if (questions.length > 0) {
      console.log('\nFirst question:');
      console.log(JSON.stringify(questions[0], null, 2));
    } else {
      console.log('\nNo questions returned!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

main();
