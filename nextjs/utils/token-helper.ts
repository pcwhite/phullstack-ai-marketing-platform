import { getEncoding, getEncodingNameForModel } from "js-tiktoken";

// Create a single encoding instance, this makes the token count calculation faster
const encoding = getEncoding(getEncodingNameForModel("gpt-4o-mini"));

export const getPromptTokenCount = (prompt: string): number => {
  const tokens = encoding.encode(prompt || "");
  return tokens.length;
};

export const formatTokens = (tokenCount: number): string => {
  if (tokenCount < 1000) {
    return tokenCount.toString();
  } else {
    const kCount = tokenCount / 1000;
    const roundedKCount = Math.round(kCount * 10) / 10;
    return `${roundedKCount}k`;
  }
};
