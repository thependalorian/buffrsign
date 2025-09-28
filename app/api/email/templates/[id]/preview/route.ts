import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailTemplateEngine } from '@/lib/services/email/template-engine';
import { z } from 'zod';

const previewSchema = z.object({
  recipient_name: z.string().optional(),
  document_title: z.string().optional(),
  sender_name: z.string().optional(),
  expires_at: z.string().optional(),
  custom_message: z.string().optional(),
  days_remaining: z.number().optional(),
  completed_at: z.string().optional(),
  document_url: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const previewData = previewSchema.parse(body);

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching template:', templateError);
      return NextResponse.json(
        { error: 'Failed to fetch template', details: templateError.message },
        { status: 500 }
      );
    }

    // Render template with preview data
    const templateEngine = new EmailTemplateEngine();
    
    // Transform previewData to match TemplateContext structure
    const templateContext = {
      _document: {
        id: 'preview-doc-123',
        title: previewData.document_title || 'Sample Document',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: previewData.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        sender_name: previewData.sender_name || 'John Doe',
        sender_email: 'john@example.com'
      },
      recipient: {
        id: 'preview-recipient-123',
        name: previewData.recipient_name || 'Jane Smith',
        email: 'jane@example.com',
        role: 'signer'
      },
      _user: {
        id: 'preview-user-123',
        name: previewData.sender_name || 'John Doe',
        email: 'john@example.com',
        role: 'sender'
      },
      custom_message: previewData.custom_message,
      days_remaining: previewData.days_remaining || 7,
      completed_at: previewData.completed_at,
      document_url: previewData.document_url || 'https://example.com/document'
    };
    
    try {
      const renderedSubject = await templateEngine.processTemplate(
        template.subject,
        templateContext
      );
      
      const renderedHtml = await templateEngine.processTemplate(
        template.html_content,
        templateContext
      );
      
      const renderedText = template.text_content 
        ? await templateEngine.processTemplate(template.text_content, templateContext)
        : null;

      return NextResponse.json({
        subject: renderedSubject,
        html_content: renderedHtml,
        text_content: renderedText,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          variables: template.variables
        },
        preview_data: previewData
      });
    } catch (renderError) {
      console.error('Error rendering template:', renderError);
      return NextResponse.json(
        { error: 'Failed to render template', details: renderError instanceof Error ? renderError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
