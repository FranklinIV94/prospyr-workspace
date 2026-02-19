#!/usr/bin/env python3
"""
ALBS LangExtract Document Processor
Standard tool for ALL document data extraction tasks
Per Franklin's mandate: February 9, 2026
"""

import os
import argparse
import langextract as lx
import textwrap
import json
from pathlib import Path

# Set up Gemini API key
os.environ['LANGEXTRACT_API_KEY'] = 'AIzaSyDJEZb24PG0AKb6u7miXDeSR7IvpKGIG_A'

def get_extraction_template(doc_type):
    """Get appropriate extraction template based on document type"""
    
    templates = {
        'tax': {
            'prompt': textwrap.dedent("""
            Extract tax-related financial data and client information in order of appearance.
            Focus on: income sources, deductions, tax amounts, dates, client details, business expenses.
            Use exact text for extractions. Provide relevant tax and financial attributes.
            """),
            'examples': [
                lx.data.ExampleData(
                    text="John Smith (SSN: XXX-XX-1234) had W2 income of $75,000 and business deductions of $5,200 for tax year 2025.",
                    extractions=[
                        lx.data.Extraction(
                            extraction_class="client_name",
                            extraction_text="John Smith",
                            attributes={"document_type": "tax_return", "tax_year": "2025"}
                        ),
                        lx.data.Extraction(
                            extraction_class="income",
                            extraction_text="$75,000",
                            attributes={"income_type": "W2", "tax_year": "2025"}
                        ),
                        lx.data.Extraction(
                            extraction_class="deduction", 
                            extraction_text="$5,200",
                            attributes={"deduction_type": "business", "tax_year": "2025"}
                        )
                    ]
                )
            ]
        },
        
        'email': {
            'prompt': textwrap.dedent("""
            Extract business communications and action items in order of appearance.
            Focus on: deadlines, meetings, action items, opportunities, client requests, follow-ups.
            Use exact text for extractions. Provide business priority and timing attributes.
            """),
            'examples': [
                lx.data.ExampleData(
                    text="Hi Franklin, can we schedule a meeting next Tuesday to discuss our Q1 tax planning? I need the documents by March 15th deadline.",
                    extractions=[
                        lx.data.Extraction(
                            extraction_class="meeting_request",
                            extraction_text="schedule a meeting next Tuesday",
                            attributes={"priority": "medium", "timeline": "next_week"}
                        ),
                        lx.data.Extraction(
                            extraction_class="deadline",
                            extraction_text="March 15th deadline",
                            attributes={"urgency": "high", "document_type": "tax_planning"}
                        ),
                        lx.data.Extraction(
                            extraction_class="service_needed",
                            extraction_text="Q1 tax planning",
                            attributes={"service_type": "tax_planning", "client_need": "quarterly"}
                        )
                    ]
                )
            ]
        },
        
        'contract': {
            'prompt': textwrap.dedent("""
            Extract contract terms and legal obligations in order of appearance.  
            Focus on: payment terms, deadlines, responsibilities, amounts, deliverables, termination clauses.
            Use exact text for extractions. Provide legal and business context attributes.
            """),
            'examples': [
                lx.data.ExampleData(
                    text="Payment of $5,000 is due within 30 days of invoice date. Client must provide all documents by December 1st, 2026.",
                    extractions=[
                        lx.data.Extraction(
                            extraction_class="payment_terms",
                            extraction_text="Payment of $5,000 is due within 30 days",
                            attributes={"amount": "$5,000", "timeline": "30_days", "trigger": "invoice_date"}
                        ),
                        lx.data.Extraction(
                            extraction_class="client_obligation",
                            extraction_text="Client must provide all documents by December 1st, 2026",
                            attributes={"obligation_type": "document_provision", "deadline": "2026-12-01"}
                        )
                    ]
                )
            ]
        },
        
        'prospect': {
            'prompt': textwrap.dedent("""
            Extract business opportunity and lead information in order of appearance.
            Focus on: company names, contact info, budget signals, service needs, timeline indicators.
            Use exact text for extractions. Provide lead qualification and business attributes.
            """),
            'examples': [
                lx.data.ExampleData(
                    text="TechStart Inc (contact@techstart.com) needs tax consulting for our $2M revenue business. Budget around $10K for comprehensive planning.",
                    extractions=[
                        lx.data.Extraction(
                            extraction_class="company",
                            extraction_text="TechStart Inc",
                            attributes={"lead_status": "qualified", "business_size": "medium"}
                        ),
                        lx.data.Extraction(
                            extraction_class="contact",
                            extraction_text="contact@techstart.com", 
                            attributes={"contact_type": "email", "verified": "no"}
                        ),
                        lx.data.Extraction(
                            extraction_class="revenue",
                            extraction_text="$2M revenue",
                            attributes={"business_size": "medium", "growth_stage": "scaling"}
                        ),
                        lx.data.Extraction(
                            extraction_class="budget",
                            extraction_text="Budget around $10K",
                            attributes={"service_type": "comprehensive_planning", "budget_range": "high"}
                        )
                    ]
                )
            ]
        },
        
        'financial': {
            'prompt': textwrap.dedent("""
            Extract financial data and business metrics in order of appearance.
            Focus on: revenue, expenses, ratios, trends, KPIs, comparative data, growth metrics.
            Use exact text for extractions. Provide financial analysis and business context attributes.
            """),
            'examples': [
                lx.data.ExampleData(
                    text="Q3 2025 revenue increased 15% to $450K with gross margin of 65% and operating expenses of $200K.",
                    extractions=[
                        lx.data.Extraction(
                            extraction_class="revenue",
                            extraction_text="$450K",
                            attributes={"period": "Q3_2025", "growth": "15%", "trend": "positive"}
                        ),
                        lx.data.Extraction(
                            extraction_class="margin",
                            extraction_text="gross margin of 65%",
                            attributes={"margin_type": "gross", "performance": "strong", "period": "Q3_2025"}
                        ),
                        lx.data.Extraction(
                            extraction_class="expenses",
                            extraction_text="operating expenses of $200K",
                            attributes={"expense_type": "operating", "period": "Q3_2025"}
                        )
                    ]
                )
            ]
        }
    }
    
    return templates.get(doc_type, templates['prospect'])  # Default to prospect template

def process_document(file_path, doc_type, output_format='jsonl', priority='medium'):
    """Process document using LangExtract with appropriate template"""
    
    try:
        print(f"🚀 Processing {doc_type} document: {file_path}")
        
        # Read file content
        file_path = Path(file_path)
        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            return None
        
        # Handle different file types
        if file_path.suffix.lower() == '.pdf':
            print("📄 PDF processing requires additional setup - using text extraction")
            # Note: Would need PDF text extraction library for full PDF support
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        
        if not content.strip():
            print("❌ File appears to be empty or unreadable")
            return None
        
        print(f"📄 Loaded {len(content)} characters")
        
        # Get extraction template
        template = get_extraction_template(doc_type)
        
        # Run LangExtract analysis
        model = "gemini-2.5-pro" if priority == "high" else "gemini-2.5-flash"
        print(f"🤖 Using model: {model}")
        
        result = lx.extract(
            text_or_documents=content,
            prompt_description=template['prompt'],
            examples=template['examples'],
            model_id=model,
        )
        
        if not result or not result.extractions:
            print("❌ No extractions found")
            return None
        
        print(f"✅ Extracted {len(result.extractions)} entities")
        
        # Generate output filename
        base_name = file_path.stem
        output_file = f"{base_name}_extracted.{output_format}"
        
        # Save results
        if output_format == 'jsonl':
            lx.io.save_annotated_documents([result], output_name=output_file, output_dir=".")
            print(f"💾 Saved to: {output_file}")
        elif output_format == 'json':
            output_data = {
                'document': str(file_path),
                'document_type': doc_type,
                'total_extractions': len(result.extractions),
                'extractions': []
            }
            
            for ext in result.extractions:
                if ext.extraction_text and ext.extraction_text.lower() != 'null':
                    output_data['extractions'].append({
                        'class': ext.extraction_class,
                        'text': ext.extraction_text,
                        'attributes': ext.attributes,
                        'position': ext.char_interval
                    })
            
            with open(output_file.replace('.jsonl', '.json'), 'w') as f:
                json.dump(output_data, f, indent=2)
            print(f"💾 Saved to: {output_file.replace('.jsonl', '.json')}")
        
        # Display summary
        display_summary(result.extractions, doc_type)
        
        return result
        
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return None

def display_summary(extractions, doc_type):
    """Display organized summary of extractions"""
    
    if not extractions:
        return
    
    # Group by extraction class
    groups = {}
    for ext in extractions:
        if ext.extraction_text and ext.extraction_text.lower() != 'null':
            class_name = ext.extraction_class
            if class_name not in groups:
                groups[class_name] = []
            groups[class_name].append(ext)
    
    print(f"\n📊 **{doc_type.upper()} EXTRACTION SUMMARY**")
    print("="*50)
    
    for class_name, items in groups.items():
        print(f"\n{class_name.upper().replace('_', ' ')} ({len(items)}):")
        for i, item in enumerate(items[:10], 1):  # Show first 10
            text = item.extraction_text[:60] + "..." if len(item.extraction_text) > 60 else item.extraction_text
            attrs = item.attributes if item.attributes else {}
            priority = attrs.get('priority', attrs.get('urgency', 'standard'))
            print(f"  {i:2d}. {text} ({priority})")
        
        if len(items) > 10:
            print(f"      ... and {len(items) - 10} more")
    
    print(f"\n✅ Processing complete: {len(extractions)} total entities extracted")

def main():
    parser = argparse.ArgumentParser(description='ALBS Document Processor using LangExtract')
    parser.add_argument('--input', '-i', required=True, help='Input document file path')
    parser.add_argument('--document-type', '-t', required=True, 
                       choices=['tax', 'email', 'contract', 'prospect', 'financial'],
                       help='Type of document to process')
    parser.add_argument('--output-format', '-o', default='jsonl',
                       choices=['jsonl', 'json'], help='Output format')
    parser.add_argument('--priority', '-p', default='medium',
                       choices=['high', 'medium', 'standard'], 
                       help='Processing priority (affects model selection)')
    
    args = parser.parse_args()
    
    print("🎯 **ALBS LANGEXTRACT DOCUMENT PROCESSOR**")
    print(f"Per Franklin's mandate: ALL document extraction uses LangExtract\n")
    
    result = process_document(
        file_path=args.input,
        doc_type=args.document_type,
        output_format=args.output_format,
        priority=args.priority
    )
    
    if result:
        print(f"\n🚀 Ready for business integration:")
        print(f"   • CRM data import")
        print(f"   • QuickBooks automated entry") 
        print(f"   • Calendar/task creation")
        print(f"   • Zapier workflow triggers")
        print(f"\nALBS competitive advantage: AI-powered document processing! 📈")

if __name__ == "__main__":
    main()