import {readFile} from 'fs/promises';
import {SentimentAnalyzer, PorterStemmer, WordTokenizer} from 'natural';

const analyzeSentiment = async (filePath: string): Promise<number> => {
  const text = await readFile(filePath);
  const tokens = new WordTokenizer().tokenize(text.toString());

  if (!tokens) {
    throw new Error('Failed to tokenize text');
  }

  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'senticon');
  return analyzer.getSentiment(tokens);
};

export default analyzeSentiment;
