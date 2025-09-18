"""
LlamaIndex-backed document intelligence utilities with safe fallbacks.

These helpers will attempt real semantic analysis using LlamaIndex. If the
library is not installed or any runtime error occurs, they fall back to
deterministic results so the API remains usable.
"""

from typing import Any, Dict, List


def _stub_result(file_path: str, document_type: str) -> Dict[str, Any]:
    return {
        "document_summary": f"Summary for {document_type} at {file_path} (stub)",
        "key_clauses": [],
        "signature_fields": [],
        "compliance_status": {"eta_2019": "unknown"},
        "recommendations": [],
        "engine": "stub",
    }


def analyze_document(file_path: str, document_type: str = "contract") -> Dict[str, Any]:
    """
    Analyze an uploaded document for summary, key clauses, and basic compliance hints.

    Behavior:
    - If LlamaIndex is enabled and importable, performs minimal semantic indexing of the
      document and issues a few targeted queries.
    - Otherwise, returns a deterministic stub payload.
    """
    try:
        # Import here to attempt real integration and allow graceful fallback if missing
        from llama_index.core import VectorStoreIndex  # type: ignore
        from llama_index.readers.file import PDFReader  # type: ignore
        # Load and index the document
        reader = PDFReader()
        documents = reader.load_data(file_path)
        index = VectorStoreIndex.from_documents(documents)
        query = index.as_query_engine()

        # Minimal prompts that do not require specific model configuration beyond defaults
        summary = str(query.query(
            f"Provide a concise, 5-bullet summary of this {document_type} document."
        ))

        clause_topics: List[str] = [
            "governing law", "termination", "payment terms", "confidentiality",
        ]
        key_clauses: List[Dict[str, str]] = []
        for topic in clause_topics:
            response = str(query.query(
                f"Extract and briefly summarize any clauses related to '{topic}'."
            ))
            key_clauses.append({"topic": topic, "summary": response})

        signature_fields_hint = str(query.query(
            "Identify locations or sections where signatures are mentioned or required."
        ))

        compliance_hint = str(query.query(
            "From the content, do you see elements supporting ETA 2019 compliance (Namibia):"
            " Sec 17 recognition, Sec 20 signatures, Sec 21 integrity? Summarize briefly."
        ))

        return {
            "document_summary": summary,
            "key_clauses": key_clauses,
            "signature_fields": [signature_fields_hint] if signature_fields_hint else [],
            "compliance_status": {"eta_2019_notes": compliance_hint},
            "recommendations": [],
            "engine": "llamaindex",
        }
    except Exception:
        # Never fail the request due to optional AI; fall back to stub
        return _stub_result(file_path, document_type)


def analyze_document_stub(file_path: str, document_type: str = "contract") -> Dict[str, Any]:
    """
    Backwards-compatible alias used by existing endpoints; prefers real analysis
    when enabled and falls back to stub otherwise.
    """
    return analyze_document(file_path=file_path, document_type=document_type)

