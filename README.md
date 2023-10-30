# Economic Report of the President Sentiment

## Overview
This repository contains raw economic reports of the president, along with a NodeJS script that converts these PDFs to images, then uses [Tessaract](https://www.npmjs.com/package/tesseract.js) to extract the text from these images. Finally, the script uses [Natural](https://naturalnode.github.io/natural/) to analyze the sentiment of the economic reports.

## Getting Started
Run `npm i` to install dependencies, and `npm start` to execute the script. View the output in the `sentiment.json` file.