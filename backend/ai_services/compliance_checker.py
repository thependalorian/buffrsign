"""
Optional LlamaIndex-backed compliance analysis with safe fallbacks.
"""

from typing import Any, Dict, List
import os

_LLAMAINDEX_IMPORTED = False
try:
    from llama_index.core import VectorStoreIndex  # type: ignore
    from llama_index.core.schema import Document  # type: ignore
    _LLAMAINDEX_IMPORTED = True
except Exception:
    _LLAMAINDEX_IMPORTED = False


def _stub(document_id: str, frameworks: List[str], jurisdiction: str) -> Dict[str, Any]:
    return {
        "document_id": document_id,
        "frameworks": frameworks,
        "jurisdiction": jurisdiction,
        "results": {fw: "pending_review" for fw in frameworks},
        "engine": "stub",
    }


def analyze_compliance(document_id: str, frameworks: List[str], jurisdiction: str) -> Dict[str, Any]:
    if not _LLAMAINDEX_IMPORTED:
        return _stub(document_id, frameworks, jurisdiction)

    try:
        # Use a tiny guidance doc enumerating checks
        eta_points = [
            "Section 17: Legal recognition",
            "Section 20: Electronic signatures",
            "Section 21: Integrity of information",
        ]
        doc = Document(text="\n".join(eta_points))
        index = VectorStoreIndex.from_documents([doc])
        query = index.as_query_engine()

        results: Dict[str, Any] = {}
        for fw in frameworks:
            if fw.lower() == "eta_2019":
                resp = str(query.query(
                    "Summarize whether the document likely meets ETA 2019 basics and list potential gaps."
                ))
                results[fw] = {"summary": resp}
            else:
                results[fw] = {"summary": "Not evaluated"}

        return {
            "document_id": document_id,
            "frameworks": frameworks,
            "jurisdiction": jurisdiction,
            "results": results,
            "engine": "llamaindex",
        }
    except Exception:
        return _stub(document_id, frameworks, jurisdiction)


def analyze_compliance_stub(document_id: str, frameworks: List[str], jurisdiction: str) -> Dict[str, Any]:
    # Backwards-compatible name retained by API endpoint
    return analyze_compliance(document_id, frameworks, jurisdiction)

