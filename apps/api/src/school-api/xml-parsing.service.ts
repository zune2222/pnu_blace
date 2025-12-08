import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class XmlParsingService {
  private readonly logger = new Logger(XmlParsingService.name);

  extractCDATA(xmlData: string, tagName: string): string {
    const regex = new RegExp(
      `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
      'i',
    );
    const match = xmlData.match(regex);
    return match ? match[1].trim() : '';
  }

  extractCDATAFromSection(sectionXml: string, tagName: string): string {
    const regex = new RegExp(
      `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
      'i',
    );
    const match = sectionXml.match(regex);
    return match ? match[1].trim() : '';
  }

  extractSection(xmlData: string, sectionName: string): string | null {
    const match = xmlData.match(
      new RegExp(`<${sectionName}>([\\s\\S]*?)</${sectionName}>`, 'i'),
    );
    return match ? match[1] : null;
  }

  extractAllItems(xmlData: string): string[] {
    const items: string[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlData)) !== null) {
      items.push(match[1]);
    }

    return items;
  }

  isSuccessResponse(xmlData: string): boolean {
    const resultCode = this.extractCDATA(xmlData, 'resultCode');
    return resultCode === '0';
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  parseInteger(value: string, defaultValue: number = 0): number {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  validateRequired(value: string, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`Required field ${fieldName} is missing or empty`);
    }
  }

  logXmlParsing(operationName: string, xmlData: string): void {
    this.logger.debug(
      `Parsing ${operationName} XML: ${xmlData.substring(0, 200)}...`,
    );
  }

  logParsingResult(operationName: string, result: any): void {
    this.logger.debug(
      `Parsed ${operationName} result: ${JSON.stringify(result)}`,
    );
  }
}
