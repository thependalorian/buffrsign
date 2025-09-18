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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
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
    
    try {
      const renderedSubject = await templateEngine.renderTemplate(
        template.subject,
        previewData
      );
      
      const renderedHtml = await templateEngine.renderTemplate(
        template.html_content,
        previewData
      );
      
      const renderedText = template.text_content 
        ? await templateEngine.renderTemplate(template.text_content, previewData)
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
        { error: 'Failed to render template', details: renderError.message },
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
