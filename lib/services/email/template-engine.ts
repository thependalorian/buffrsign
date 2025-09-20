/**
 * Email Template Engine
 * 
 * Handles template processing, variable substitution, and content generation
 * for the BuffrSign email system.
 */

import { 
  EmailTemplate, 
  TemplateContext, 
  ProcessedTemplate,
  TemplateVariable,
  EmailType 
} from '@/lib/types/email';

export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();
  private defaultLocale = 'en-NA';

  /**
   * Load template from database or cache
   */
  async loadTemplate(
    templateType: EmailType, 
    locale: string = this.defaultLocale
  ): Promise<EmailTemplate | null> {
    const key = `${templateType}_${locale}`;
    
    if (this.templates.has(key)) {
      return this.templates.get(key)!;
    }

    // Load from database (this would be implemented with Supabase client)
    try {
      // This is a placeholder - in real implementation, you'd query the database
      const template = await this.fetchTemplateFromDatabase(templateType, locale);
      
      if (template) {
        this.templates.set(key, template);
        return template;
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }

    return null;
  }

  /**
   * Process template with context variables
   */
  async processTemplate(
    templateType: EmailType,
    context: TemplateContext,
    locale: string = this.defaultLocale
  ): Promise<ProcessedTemplate | null> {
    const template = await this.loadTemplate(templateType, locale);
    
    if (!template) {
      console.error(`Template not found: ${templateType} (${locale})`);
      return null;
    }

    try {
      const processedTemplate: ProcessedTemplate = {
        subject: this.processString(template.subject_template, context),
        html_content: this.processString(template.html_template, context),
        text_content: this.processString(template.text_template, context),
        variables_used: this.extractUsedVariables(template, context),
      };

      return processedTemplate;
    } catch (error) {
      console.error('Template processing error:', error);
      return null;
    }
  }

  /**
   * Process string with variable substitution
   */
  private processString(template: string, context: TemplateContext): string {
    let processed = template;

    // Process _document variables
    if (context._document) {
      processed = this.replaceVariables(processed, {
        '_document.title': context._document.title,
        '_document.id': context._document.id,
        '_document.status': context._document.status,
        '_document.created_at': this.formatDate(context._document.created_at),
        '_document.expires_at': context._document.expires_at ? this.formatDate(context._document.expires_at) : 'N/A',
        '_document.sender_name': context._document.sender_name,
        '_document.sender_email': context._document.sender_email,
      });
    }

    // Process recipient variables
    if (context.recipient) {
      processed = this.replaceVariables(processed, {
        'recipient.name': context.recipient.name,
        'recipient.email': context.recipient.email,
        'recipient.role': context.recipient.role,
      });
    }

    // Process _user variables
    if (context._user) {
      processed = this.replaceVariables(processed, {
        '_user.name': context._user.name,
        '_user.email': context._user.email,
      });
    }

    // Process company variables
    if (context.company) {
      processed = this.replaceVariables(processed, {
        'company.name': context.company.name,
        'company.logo_url': context.company.logo_url || '',
        'company.website': context.company.website || '',
        'company.support_email': context.company.support_email || '',
      });
    }

    // Process custom variables
    if (context.custom) {
      processed = this.replaceVariables(processed, context.custom);
    }

    // Process conditional blocks
    processed = this.processConditionalBlocks(processed, context);

    // Process loops
    processed = this.processLoops(processed, context);

    return processed;
  }

  /**
   * Replace variables in template string
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let processed = template;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const safeValue = this.sanitizeValue(value);
      processed = processed.replace(new RegExp(placeholder, 'g'), safeValue);
    });

    return processed;
  }

  /**
   * Process conditional blocks (if/else/endif)
   */
  private processConditionalBlocks(template: string, context: TemplateContext): string {
    let processed = template;

    // Process {{#if variable}} ... {{/if}} blocks
    const ifRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;
    processed = processed.replace(ifRegex, (match, condition, content) => {
      const value = this.getContextValue(condition.trim(), context);
      return this.evaluateCondition(value) ? content : '';
    });

    // Process {{#unless variable}} ... {{/unless}} blocks
    const unlessRegex = /\{\{#unless\s+([^}]+)\}\}(.*?)\{\{\/unless\}\}/gs;
    processed = processed.replace(unlessRegex, (match, condition, content) => {
      const value = this.getContextValue(condition.trim(), context);
      return !this.evaluateCondition(value) ? content : '';
    });

    // Process {{#if variable}} ... {{else}} ... {{/if}} blocks
    const ifElseRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/gs;
    processed = processed.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
      const value = this.getContextValue(condition.trim(), context);
      return this.evaluateCondition(value) ? ifContent : elseContent;
    });

    return processed;
  }

  /**
   * Process loops (for each)
   */
  private processLoops(template: string, context: TemplateContext): string {
    let processed = template;

    // Process {{#each array}} ... {{/each}} blocks
    const eachRegex = /\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}/gs;
    processed = processed.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getContextValue(arrayPath.trim(), context);
      
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, _index) => {
        let itemContent = content;
        
        // Replace {{this}} with current item
        itemContent = itemContent.replace(/\{\{this\}\}/g, this.sanitizeValue(item));
        
        // Replace {{@_index}} with current index
        itemContent = itemContent.replace(/\{\{@_index\}\}/g, _index.toString());
        
        // Replace item properties
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            itemContent = itemContent.replace(new RegExp(placeholder, 'g'), this.sanitizeValue(value));
          });
        }
        
        return itemContent;
      }).join('');
    });

    return processed;
  }

  /**
   * Get value from context by path (e.g., '_document.title')
   */
  private getContextValue(path: string, context: TemplateContext): unknown {
    const parts = path.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Evaluate condition for conditional blocks
   */
  private evaluateCondition(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      return value.length > 0 && value.toLowerCase() !== 'false';
    }
    
    if (typeof value === 'number') {
      return value !== 0;
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    return Boolean(value);
  }

  /**
   * Extract variables used in template
   */
  private extractUsedVariables(template: EmailTemplate, context: TemplateContext): string[] {
    const variables: string[] = [];
    const allContent = `${template.subject_template} ${template.html_template} ${template.text_template}`;
    
    // Find all {{variable}} patterns
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;
    
    while ((match = variableRegex.exec(allContent)) !== null) {
      const variable = match[1].trim();
      
      // Skip control structures
      if (!variable.startsWith('#') && !variable.startsWith('/') && variable !== 'else') {
        variables.push(variable);
      }
    }
    
    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Sanitize value for safe output
   */
  private sanitizeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    
    return String(value);
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Windhoek',
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for unmatched conditionals
    const ifCount = (template.match(/\{\{#if\s+[^}]+\}\}/g) || []).length;
    const endifCount = (template.match(/\{\{\/if\}\}/g) || []).length;
    
    if (ifCount !== endifCount) {
      errors.push('Unmatched {{#if}}/{{/if}} blocks');
    }
    
    // Check for unmatched loops
    const eachCount = (template.match(/\{\{#each\s+[^}]+\}\}/g) || []).length;
    const endeachCount = (template.match(/\{\{\/each\}\}/g) || []).length;
    
    if (eachCount !== endeachCount) {
      errors.push('Unmatched {{#each}}/{{/each}} blocks');
    }
    
    // Check for unmatched unless
    const unlessCount = (template.match(/\{\{#unless\s+[^}]+\}\}/g) || []).length;
    const endunlessCount = (template.match(/\{\{\/unless\}\}/g) || []).length;
    
    if (unlessCount !== endunlessCount) {
      errors.push('Unmatched {{#unless}}/{{/unless}} blocks');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templates.clear();
  }

  /**
   * Get cached template count
   */
  getCacheSize(): number {
    return this.templates.size;
  }

  /**
   * Placeholder for database template fetching
   * In real implementation, this would use Supabase client
   */
  private async fetchTemplateFromDatabase(
    templateType: EmailType, 
    locale: string
  ): Promise<EmailTemplate | null> {
    // This is a placeholder implementation
    // In the real implementation, you would:
    // 1. Use Supabase client to query email_templates table
    // 2. Filter by template_type and locale
    // 3. Return the first active template found
    
    console.log(`Fetching template from database: ${templateType} (${locale})`);
    return null;
  }
}
