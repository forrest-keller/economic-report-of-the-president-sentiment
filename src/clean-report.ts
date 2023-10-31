import {mkdir, readFile, writeFile} from 'fs/promises';
import {SentenceTokenizer, TreebankWordTokenizer, WordTokenizer} from 'natural';
import path from 'path';

const cleanString = (input: string): string => {
  let output = '';

  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }

  return output;
};

const cleanReport = async (filePath: string, ouputDir: string) => {
  const text = await readFile(filePath);
  const tokens = new TreebankWordTokenizer()
    .tokenize(text.toString())
    .map(cleanString)
    .map(t => t.trim().normalize())
    .filter(t => !/^[0-9,.+-]*$/.test(t));

  if (!tokens) {
    throw new Error('Failed to tokenize text');
  }

  const fileName = path.basename(filePath);
  await mkdir(ouputDir, {recursive: true});
  await writeFile(`${ouputDir}/${fileName}`, tokens.join(' '));
};

export default cleanReport;
